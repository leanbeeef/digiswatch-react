import React, { useEffect, useMemo, useState } from "react";
import { Button, Badge, Spinner, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  getDocs,
  addDoc,
  getCountFromServer,
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
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentPreviews, setCommentPreviews] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [commentLikeCounts, setCommentLikeCounts] = useState({});
  const [commentLiked, setCommentLiked] = useState({});
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
        // fetch first comment + counts for previews
        data.forEach((item) => loadCommentPreview(item));
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

  const handleOpenInGenerator = (palette) => {
    navigate("/palette-generator", { state: { palette } });
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

  const timeAgo = (iso) => {
    if (!iso) return "";
    const then = new Date(iso);
    const now = new Date();
    const diff = (now - then) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const initialsAvatar = (item) => {
    const name = formatName(item, ownerInfo) || "C";
    const initials = name.slice(0, 2).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
      <rect width='64' height='64' rx='12' fill='%230D6EFD'/>
      <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'
        fill='%23fff' font-family='Inter,Arial' font-size='24' font-weight='700'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const avatarFallback = (item) => {
    // prefer stored avatar from ownerInfo (fetched profile) first
    const profileAvatar = item?.ownerId
      ? ownerInfo[item.ownerId]?.avatar
      : null;
    const raw = profileAvatar || item.ownerAvatar;
    if (raw && typeof raw === "string" && raw.trim().length > 4) return raw;
    return initialsAvatar(item);
  };

  const commentAvatar = (comment) => {
    const profileAvatar =
      comment.authorId && ownerInfo[comment.authorId]
        ? ownerInfo[comment.authorId].avatar
        : null;
    const raw = profileAvatar || comment.authorAvatar;
    if (raw && typeof raw === "string" && raw.trim().length > 4) return raw;
    const name =
      (comment.authorId && ownerInfo[comment.authorId]?.username) ||
      comment.authorName ||
      "User";
    const initials = name.slice(0, 2).toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
      <rect width='40' height='40' rx='10' fill='%230D6EFD'/>
      <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'
        fill='%23fff' font-family='Inter,Arial' font-size='16' font-weight='700'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const loadCommentPreview = async (item) => {
    const key = `${item.ownerId || "anon"}-${item.id}`;
    if (commentPreviews[key]) return;
    if (!item.ownerId) return;
    try {
      const commentsRef = collection(
        db,
        "users",
        item.ownerId,
        "createdPalettes",
        item.id,
        "comments"
      );
      const [previewSnap, countSnap] = await Promise.all([
        getDocs(query(commentsRef, orderBy("createdAt", "desc"), limit(1))),
        getCountFromServer(commentsRef),
      ]);
      const preview = previewSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))[0];
      if (preview?.authorId) {
        fetchOwnerProfiles([preview.authorId]);
      }
      setCommentPreviews((prev) => ({ ...prev, [key]: preview }));
      setCommentCounts((prev) => ({ ...prev, [key]: countSnap.data().count }));
      if (preview?.id) {
        fetchCommentLikeCount(item.ownerId, item.id, preview.id);
      }
    } catch (err) {
      console.warn("Failed to load comment preview", err);
    }
  };

  const toggleComments = async (item) => {
    const key = `${item.ownerId || "anon"}-${item.id}`;
    setOpenComments((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!comments[key] && item.ownerId) {
      try {
        const snap = await getDocs(
          query(
            collection(
              db,
              "users",
              item.ownerId,
              "createdPalettes",
              item.id,
              "comments"
            ),
            orderBy("createdAt", "desc"),
            limit(10)
          )
        );
        const commentData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComments((prev) => ({
          ...prev,
          [key]: commentData,
        }));
        // fetch commenter profiles to overwrite displayName/email with username/avatar
        const commenterIds = Array.from(
          new Set(commentData.map((c) => c.authorId).filter(Boolean))
        );
        fetchOwnerProfiles(commenterIds);
        setCommentCounts((prev) => ({
          ...prev,
          [key]: Math.max(prev[key] || 0, commentData.length),
        }));
        // load like counts for loaded comments
        commentData.forEach((c) =>
          fetchCommentLikeCount(item.ownerId, item.id, c.id)
        );
      } catch (err) {
        console.warn("Failed to load comments", err);
      }
    }
  };

  const fetchCommentLikeCount = async (ownerId, paletteId, commentId) => {
    if (!ownerId || !paletteId || !commentId) return;
    try {
      const likesRef = collection(
        db,
        "users",
        ownerId,
        "createdPalettes",
        paletteId,
        "comments",
        commentId,
        "likes"
      );
      const countSnap = await getCountFromServer(likesRef);
      setCommentLikeCounts((prev) => ({
        ...prev,
        [commentId]: countSnap.data().count,
      }));
    } catch (err) {
      console.warn("Failed to load comment like count", err);
    }
  };

  const toggleCommentLike = async (item, comment) => {
    if (!currentUser) {
      setError("You must be signed in to like comments.");
      return;
    }
    const likeRef = doc(
      db,
      "users",
      item.ownerId,
      "createdPalettes",
      item.id,
      "comments",
      comment.id,
      "likes",
      currentUser.uid
    );
    const key = comment.id;
    try {
      const existing = await getDoc(likeRef);
      if (existing.exists()) {
        await deleteDoc(likeRef);
        setCommentLikeCounts((prev) => ({
          ...prev,
          [key]: Math.max((prev[key] || 1) - 1, 0),
        }));
        setCommentLiked((prev) => ({ ...prev, [key]: false }));
      } else {
        await setDoc(likeRef, { createdAt: new Date().toISOString() });
        setCommentLikeCounts((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1,
        }));
        setCommentLiked((prev) => ({ ...prev, [key]: true }));
      }
    } catch (err) {
      console.error("Comment like failed", err);
      setError("Could not update comment like.");
    }
  };

  const deleteComment = async (item, comment) => {
    if (!currentUser || !item.ownerId || !comment?.id) {
      setError("You must be signed in to delete comments.");
      return;
    }
    const key = `${item.ownerId || "anon"}-${item.id}`;
    const ref = doc(
      db,
      "users",
      item.ownerId,
      "createdPalettes",
      item.id,
      "comments",
      comment.id
    );
    try {
      await deleteDoc(ref);
      setComments((prev) => {
        const next = (prev[key] || []).filter((c) => c.id !== comment.id);
        return { ...prev, [key]: next };
      });
      setCommentCounts((prev) => ({
        ...prev,
        [key]: Math.max((prev[key] || 1) - 1, 0),
      }));
      setCommentLikeCounts((prev) => {
        const copy = { ...prev };
        delete copy[comment.id];
        return copy;
      });
      setCommentLiked((prev) => {
        const copy = { ...prev };
        delete copy[comment.id];
        return copy;
      });
      setCommentPreviews((prev) => {
        const copy = { ...prev };
        if (copy[key]?.id === comment.id) {
          delete copy[key];
        }
        return copy;
      });
      await loadCommentPreview(item);
    } catch (err) {
      console.error("Delete comment failed", err);
      setError("Could not delete comment.");
    }
  };

  const submitComment = async (item) => {
    if (!currentUser || !item.ownerId) {
      setError("You must be signed in to comment.");
      return;
    }
    const key = `${item.ownerId || "anon"}-${item.id}`;
    const text = (commentInputs[key] || "").trim();
    if (!text) return;
    try {
      const now = new Date().toISOString();
      const newRef = await addDoc(
        collection(
          db,
          "users",
          item.ownerId,
          "createdPalettes",
          item.id,
          "comments"
        ),
        {
          text,
          authorId: currentUser.uid,
          authorName:
            currentUser.username ||
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Member",
          authorAvatar: currentUser.avatar || currentUser.photoURL || "",
          createdAt: now,
        }
      );
      // Update counts and likes state for the new comment
      fetchOwnerProfiles([currentUser.uid]);
      fetchCommentLikeCount(item.ownerId, item.id, newRef.id);
      setCommentCounts((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1,
      }));
      setComments((prev) => ({
        ...prev,
        [key]: [
          {
            id: newRef.id,
            text,
            authorName:
              currentUser.username ||
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "Member",
            authorAvatar: currentUser.avatar || currentUser.photoURL || "",
            createdAt: now,
          },
          ...(prev[key] || []),
        ],
      }));
      setCommentInputs((prev) => ({ ...prev, [key]: "" }));
    } catch (err) {
      console.error("Comment failed", err);
      setError("Could not post comment.");
    }
  };

  return (
    <section className="feed-shell py-4 rounded">
      <div className="feed-header d-flex align-items-center justify-content-between mb-3">
        <div>
          <p className="text-uppercase text-muted small mb-1">Live community</p>
          <h2 className="h4 fw-bold mb-0">Fresh palettes & creators</h2>
          <p className="text-muted mb-0">
            A scrollable feed of drops, likes, and comments. Jump in.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* <Badge bg="light" text="dark">
            {feedCards.length} entries
          </Badge> */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate("/palette-generator")}
          >
            Post a palette
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2 px-3 mb-3">{error}</div>
      )}
      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner animation="border" size="sm" /> Loading feed...
        </div>
      ) : (
        <div className="feed-stream">
          {feedCards.map((item) => {
            const key = `${item.ownerId || "anon"}-${item.id}`;
            return (
              <div className="feed-card" key={key}>
                <div className="feed-meta">
                  <div className="feed-avatar">
                    <img
                      src={avatarFallback(item)}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = initialsAvatar(item);
                      }}
                    />
                  </div>
                  <div className="feed-author">
                    <span
                      className={`feed-name ${item.ownerId ? "link-like" : ""}`}
                      role={item.ownerId ? "button" : undefined}
                      tabIndex={item.ownerId ? 0 : undefined}
                      onClick={() =>
                        item.ownerId && navigate(`/u/${item.ownerId}`)
                      }
                      onKeyDown={(event) => {
                        if (
                          item.ownerId &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          navigate(`/u/${item.ownerId}`);
                        }
                      }}
                    >
                      {formatName(item, ownerInfo)}
                    </span>
                    <span className="feed-time text-muted">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div className="feed-actions">
                    <button
                      className="pp-open-generator"
                      onClick={() => handleOpenInGenerator(palette)}
                      title="Open in Palette Generator"
                    >
                      <img
                        src="/favicon.ico"
                        alt="Open in generator"
                        height="18"
                        width="18"
                      />
                    </button>
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

                <div className="feed-title">
                  {item.name || "Untitled palette"}
                </div>
                {item.description ? (
                  <div className="feed-desc text-muted">{item.description}</div>
                ) : null}

                <div
                  className="pp-color-strip feed-strip"
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

                <div className="feed-footer">
                  <div className="d-flex gap-3 align-items-center">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => toggleComments(item)}
                    >
                      Comments (
                      {commentCounts[key] ??
                        (comments[key]?.length || commentPreviews[key] ? 1 : 0)}
                      )
                    </Button>
                  </div>
                </div>

                {!openComments[key] && commentPreviews[key] && (
                  <div className="feed-comment-preview">
                    <div className="feed-comment-row">
                      <img
                        src={commentAvatar(commentPreviews[key])}
                        alt=""
                        className="feed-comment-avatar"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = commentAvatar({
                            authorName:
                              (commentPreviews[key].authorId &&
                                ownerInfo[commentPreviews[key].authorId]
                                  ?.username) ||
                              commentPreviews[key].authorName ||
                              "User",
                          });
                        }}
                      />
                      <div className="feed-comment-body">
                        <div className="feed-comment-meta">
                          <div>
                            <strong className="me-2">
                              {commentPreviews[key].authorId &&
                              ownerInfo[commentPreviews[key].authorId]?.username
                                ? ownerInfo[commentPreviews[key].authorId]
                                    .username
                                : commentPreviews[key].authorName || "User"}
                            </strong>
                            <span className="text-muted">
                              {timeAgo(commentPreviews[key].createdAt)}
                            </span>
                          </div>
                          <div className="feed-comment-actions">
                            <button
                              className={`feed-comment-like-btn ${
                                commentLiked[commentPreviews[key].id]
                                  ? "is-active"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleCommentLike(item, commentPreviews[key])
                              }
                            >
                              <i className="bi bi-heart-fill"></i>
                              <span>
                                {commentLikeCounts[commentPreviews[key].id] ||
                                  0}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="feed-comment-text">
                          {commentPreviews[key].text}
                        </div>
                      </div>
                    </div>
                    {commentCounts[key] > 1 && (
                      <button
                        className="btn btn-link p-0 small text-start"
                        onClick={() => toggleComments(item)}
                      >
                        View all {commentCounts[key]} comments
                      </button>
                    )}
                  </div>
                )}

                {openComments[key] && (
                  <div className="feed-comments">
                    <div className="feed-comment-input d-flex align-items-center gap-2">
                      <img
                        src={
                          currentUser?.avatar ||
                          currentUser?.photoURL ||
                          commentAvatar({
                            authorName:
                              currentUser?.displayName ||
                              currentUser?.email ||
                              "You",
                          })
                        }
                        alt=""
                        className="feed-comment-avatar"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = commentAvatar({
                            authorName:
                              currentUser?.displayName ||
                              currentUser?.email ||
                              "You",
                          });
                        }}
                      />
                      <Form.Control
                        size="sm"
                        placeholder="Add a comment"
                        value={commentInputs[key] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitComment(item);
                          }
                        }}
                      />
                    </div>
                    <div className="small text-muted mt-2">
                      {(comments[key] || []).length
                        ? "Recent comments"
                        : "No comments yet"}
                    </div>
                    <div className="feed-comment-list">
                      {(comments[key] || []).map((c) => (
                        <div key={c.id} className="feed-comment-row pt-2">
                          <img
                            src={commentAvatar(c)}
                            alt=""
                            className="feed-comment-avatar"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = commentAvatar({
                                authorName: c.authorName || "User",
                              });
                            }}
                          />
                          <div className="feed-comment-body">
                            <div className="feed-comment-meta">
                              <div>
                                <strong className="me-2">
                                  {c.authorId && ownerInfo[c.authorId]?.username
                                    ? ownerInfo[c.authorId].username
                                    : c.authorName || "User"}
                                </strong>
                                <span className="text-muted">
                                  {timeAgo(c.createdAt)}
                                </span>
                              </div>
                              <div className="feed-comment-actions">
                                <button
                                  className={`feed-comment-like-btn ${
                                    commentLiked[c.id] ? "is-active" : ""
                                  }`}
                                  onClick={() => toggleCommentLike(item, c)}
                                >
                                  <i className="bi bi-heart-fill"></i>
                                  <span>{commentLikeCounts[c.id] || 0}</span>
                                </button>
                                {(currentUser?.uid === c.authorId ||
                                  currentUser?.uid === item.ownerId) && (
                                  <button
                                    className="feed-comment-delete-btn"
                                    onClick={() => deleteComment(item, c)}
                                    aria-label="Delete comment"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="feed-comment-text">{c.text}</div>
                          </div>
                        </div>
                      ))}
                      {!comments[key]?.length && commentPreviews[key] && (
                        <div className="feed-comment-row">
                          <img
                            src={commentAvatar(commentPreviews[key])}
                            alt=""
                            className="feed-comment-avatar"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = commentAvatar({
                                authorName:
                                  (commentPreviews[key].authorId &&
                                    ownerInfo[commentPreviews[key].authorId]
                                      ?.username) ||
                                  commentPreviews[key].authorName ||
                                  "User",
                              });
                            }}
                          />
                          <div className="feed-comment-body">
                            <div className="feed-comment-meta">
                              <strong className="me-2">
                                {commentPreviews[key].authorId &&
                                ownerInfo[commentPreviews[key].authorId]
                                  ?.username
                                  ? ownerInfo[commentPreviews[key].authorId]
                                      .username
                                  : commentPreviews[key].authorName || "User"}
                              </strong>
                              <span className="text-muted">
                                {timeAgo(commentPreviews[key].createdAt)}
                              </span>
                            </div>
                            <div className="feed-comment-text">
                              {commentPreviews[key].text}
                            </div>
                          </div>
                        </div>
                      )}
                      {commentCounts[key] > (comments[key]?.length || 0) && (
                        <button
                          className="btn btn-link p-0 small text-start"
                          onClick={() => toggleComments(item)}
                        >
                          View all {commentCounts[key]} comments
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CommunityFeed;
