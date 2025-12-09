import React, { useEffect, useMemo, useState } from "react";
import { Button, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  writeBatch,
  increment,
} from "firebase/firestore";
import "../PopularPalettes.css";

const formatName = (item, owners) => {
  if (item?.ownerId && owners[item.ownerId]?.username) {
    return owners[item.ownerId].username;
  }
  return (
    item?.ownerName ||
    item?.ownerEmail ||
    item?.ownerId?.slice?.(0, 6) ||
    "Creator"
  );
};

const CommunityFeed = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(new Set());
  const [busyFollow, setBusyFollow] = useState(false);
  const [error, setError] = useState("");
  const [ownerInfo, setOwnerInfo] = useState({});
  const [likes, setLikes] = useState({});
  const [likedPalettes, setLikedPalettes] = useState(() => {
    try {
      const stored = localStorage.getItem("ds-liked-palettes");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const canFollow = !!currentUser;

  const fetchOwnerProfiles = async (ownerIds) => {
    if (!ownerIds.length) return;
    const newOwners = {};
    await Promise.all(
      ownerIds.map(async (id) => {
        if (!id || ownerInfo[id]) return;
        try {
          const profileRef = doc(db, "users", id);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            newOwners[id] = {
              username:
                profileSnap.data().username ||
                profileSnap.data().email?.split("@")[0] ||
                id.slice(0, 6),
              avatar: profileSnap.data().avatar || "",
            };
          }
        } catch (err) {
          console.warn("Failed to fetch owner profile", err);
        }
      })
    );
    if (Object.keys(newOwners).length) {
      setOwnerInfo((prev) => ({ ...prev, ...newOwners }));
    }
  };

  useEffect(() => {
    const loadFeed = async () => {
      try {
        let snap;
        try {
          // Preferred ordered feed (may require composite index in Firestore)
          const feedQuery = query(
            collectionGroup(db, "createdPalettes"),
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc"),
            limit(12)
          );
          snap = await getDocs(feedQuery);
        } catch (innerErr) {
          // If index missing or perms block ordering, fall back to unordered equality query
          console.warn("Ordered feed failed, falling back", innerErr);
          const fallbackQuery = query(
            collectionGroup(db, "createdPalettes"),
            where("visibility", "==", "public"),
            limit(12)
          );
          snap = await getDocs(fallbackQuery);
        }

        const data = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            colors: data.colors || [],
          };
        });
        setItems(data);
        const ownerIds = Array.from(
          new Set(data.map((entry) => entry.ownerId).filter(Boolean))
        );
        fetchOwnerProfiles(ownerIds);
      } catch (err) {
        console.error("Feed load failed", err);
        const requiresIndex =
          err?.code === "failed-precondition" ||
          /requires an index/i.test(err?.message || "");
        const perms =
          err?.code === "permission-denied" ||
          /permission/i.test(err?.message || "");
        if (requiresIndex) {
          setError(
            "Feed needs a Firestore index (visibility + createdAt). Create it from the console prompt and reload."
          );
        } else if (perms) {
          setError(
            "Feed is restricted by Firestore rules; adjust read rules for public palettes."
          );
        } else {
          setError("Could not load the latest palettes right now.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likesCollection = collection(db, "likes");
        const querySnapshot = await getDocs(likesCollection);
        const likesData = {};
        querySnapshot.forEach((docSnap) => {
          likesData[docSnap.id] = docSnap.data().count;
        });
        setLikes(likesData);
      } catch (err) {
        console.warn("Could not load likes", err);
      }
    };
    fetchLikes();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ds-liked-palettes", JSON.stringify(likedPalettes));
    } catch {
      // ignore
    }
  }, [likedPalettes]);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!currentUser) {
        setFollowing(new Set());
        return;
      }
      try {
        const snap = await getDocs(
          collection(db, "users", currentUser.uid, "following")
        );
        const ids = new Set(snap.docs.map((d) => d.id));
        setFollowing(ids);
      } catch (err) {
        console.warn("Could not load following list", err);
        // keep silently if perms block this list
      }
    };
    loadFollowing();
  }, [currentUser]);

  const handleOpen = (palette) => {
    navigate("/palette-generator", {
      state: {
        palette: {
          name: palette.name || "Community palette",
          colors: palette.colors || [],
        },
      },
    });
  };

  const likeKeyFor = (palette) =>
    palette.name || `${palette.ownerId || "anon"}-${palette.id}`;

  const handleLike = async (palette) => {
    const likeKey = likeKeyFor(palette);
    if (likedPalettes[likeKey]) return;

    try {
      const likeRef = doc(db, "likes", likeKey);
      await setDoc(likeRef, { count: increment(1) }, { merge: true });
      setLikes((prev) => ({
        ...prev,
        [likeKey]: (prev[likeKey] || 0) + 1,
      }));
      setLikedPalettes((prev) => ({ ...prev, [likeKey]: true }));
    } catch (err) {
      console.error("Like failed", err);
      setError("Could not like this palette right now.");
    }
  };

  const handleToggleFollow = async (creatorId, meta = {}) => {
    if (!canFollow || busyFollow || !creatorId) return;
    if (creatorId === currentUser.uid) return; // no self-follow
    setBusyFollow(true);
    const already = following.has(creatorId);
    const followerDoc = doc(
      db,
      "users",
      currentUser.uid,
      "following",
      creatorId
    );
    const creatorDoc = doc(
      db,
      "users",
      creatorId,
      "followers",
      currentUser.uid
    );
    const meDoc = doc(db, "users", currentUser.uid);
    const creatorProfileDoc = doc(db, "users", creatorId);
    try {
      const batch = writeBatch(db);
      if (already) {
        batch.delete(followerDoc);
        batch.delete(creatorDoc);
        batch.set(meDoc, { followingCount: increment(-1) }, { merge: true });
        batch.set(
          creatorProfileDoc,
          { followersCount: increment(-1) },
          { merge: true }
        );
      } else {
        const now = new Date().toISOString();
        batch.set(
          followerDoc,
          {
            createdAt: now,
            creatorId,
            creatorName: meta.ownerName || "Creator",
            creatorAvatar: meta.ownerAvatar || "",
          },
          { merge: true }
        );
        batch.set(
          creatorDoc,
          {
            createdAt: now,
            followerId: currentUser.uid,
            followerName:
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "Member",
            followerAvatar: currentUser.photoURL || "",
          },
          { merge: true }
        );
        batch.set(meDoc, { followingCount: increment(1) }, { merge: true });
        batch.set(
          creatorProfileDoc,
          { followersCount: increment(1) },
          { merge: true }
        );
      }
      await batch.commit();
      setFollowing((prev) => {
        const next = new Set(prev);
        if (already) {
          next.delete(creatorId);
        } else {
          next.add(creatorId);
        }
        return next;
      });
    } catch (err) {
      console.error("Follow toggle failed", err);
      setError("Could not update follow state right now.");
    } finally {
      setBusyFollow(false);
    }
  };

  const feedCards = useMemo(() => items, [items]);

  return (
    <section className="py-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">Live community</p>
          <h2 className="h4 fw-bold mb-0">Fresh palettes & creators</h2>
        </div>
        <Badge bg="light" text="dark">
          {feedCards.length} entries
        </Badge>
      </div>

      {error && (
        <div className="alert alert-warning py-2 px-3 mb-3">{error}</div>
      )}
      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner animation="border" size="sm" /> Loading feed...
        </div>
      ) : (
        <div className="row g-3">
          {feedCards.map((item) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={`${item.ownerId || "anon"}-${item.id}`}
            >
              <div className="pp-card h-100">
                  <div className="pp-card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                      <div className="pp-palette-name mb-1">
                        {item.name || "Untitled palette"}
                      </div>
                      <div className="small text-muted">
                        By{" "}
                        <span
                          className={`d-inline-flex align-items-center gap-1 ${
                            item.ownerId ? "link-like" : ""
                          }`}
                          role={item.ownerId ? "button" : undefined}
                          tabIndex={item.ownerId ? 0 : undefined}
                          onClick={() =>
                            item.ownerId && navigate(`/u/${item.ownerId}`)
                          }
                          onKeyPress={(event) => {
                            if (item.ownerId && (event.key === "Enter" || event.key === " ")) {
                              navigate(`/u/${item.ownerId}`);
                            }
                          }}
                        >
                          <i className="bi bi-person-circle"></i>
                          {formatName(item, ownerInfo)}
                        </span>
                      </div>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <button
                          className={`pp-like-inline ${
                            likedPalettes[likeKeyFor(item)] ? "is-active" : ""
                          }`}
                          onClick={() => handleLike(item)}
                          title="Like"
                        >
                          <i className="bi bi-heart-fill"></i>
                          <span className="pp-like-count-inline">
                            {likes[likeKeyFor(item)] || 0}
                          </span>
                        </button>
                        {canFollow &&
                        item.ownerId &&
                        item.ownerId !== currentUser?.uid ? (
                          <Button
                            size="sm"
                            variant={
                              following.has(item.ownerId)
                                ? "outline-secondary"
                                : "primary"
                            }
                            disabled={busyFollow}
                            onClick={() =>
                              handleToggleFollow(item.ownerId, {
                              ownerName: formatName(item, ownerInfo),
                                ownerAvatar: item.ownerAvatar,
                              })
                            }
                          >
                            {following.has(item.ownerId) ? "Unfollow" : "Follow"}
                          </Button>
                        ) : null}
                      </div>
                    </div>

                  <div
                    className="pp-color-strip"
                    role="img"
                    aria-label={`Color palette: ${(item.colors || []).join(
                      ", "
                    )}`}
                  >
                    {(item.colors || []).map((color, idx) => (
                      <div
                        key={idx}
                        className="pp-color-swatch"
                        style={{ backgroundColor: color }}
                        data-color={color}
                        title="Click to copy hex"
                        onClick={() => navigator.clipboard.writeText(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommunityFeed;
