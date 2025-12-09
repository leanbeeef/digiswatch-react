import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  writeBatch,
  where,
} from "firebase/firestore";
import SharePalette from "../components/SharePalette";
import "../PopularPalettes.css";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const { currentUser } = useAuth();
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, "users", userId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          setError("Creator not found.");
          setLoading(false);
          return;
        }
        setProfile(snap.data());

        const palettesQuery = query(
          collection(db, "users", userId, "createdPalettes"),
          where("visibility", "==", "public")
        );
        const pSnap = await getDocs(palettesQuery);
        const data = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPalettes(data);
      } catch (err) {
        console.error("Load profile failed", err);
        setError("Could not load this profile right now.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!currentUser || !userId) {
      setIsFollowing(false);
      return;
    }
    const checkFollow = async () => {
      try {
        const followDoc = await getDoc(
          doc(db, "users", currentUser.uid, "following", userId)
        );
        setIsFollowing(followDoc.exists());
      } catch (err) {
        console.warn("Failed to check follow status", err);
      }
    };
    checkFollow();
  }, [currentUser, userId]);

  const handleOpen = (palette) => {
    navigate("/palette-generator", {
      state: {
        palette: {
          name: palette.name || "Palette",
          colors: palette.colors || [],
        },
      },
    });
  };

  const toggleFollow = async () => {
    if (!currentUser || currentUser.uid === userId) return;
    setFollowLoading(true);
    setError("");
    const followDoc = doc(
      db,
      "users",
      currentUser.uid,
      "following",
      userId
    );
    const followerDoc = doc(
      db,
      "users",
      userId,
      "followers",
      currentUser.uid
    );
    const meDoc = doc(db, "users", currentUser.uid);
    const creatorDoc = doc(db, "users", userId);
    const batch = writeBatch(db);
    if (isFollowing) {
      batch.delete(followDoc);
      batch.delete(followerDoc);
      batch.set(meDoc, { followingCount: increment(-1) }, { merge: true });
      batch.set(creatorDoc, { followersCount: increment(-1) }, { merge: true });
    } else {
      const now = new Date().toISOString();
      batch.set(
        followDoc,
        {
          createdAt: now,
          creatorId: userId,
          creatorName: profile?.username || "Creator",
          creatorAvatar: profile?.avatar || "",
        },
        { merge: true }
      );
      batch.set(
        followerDoc,
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
      batch.set(creatorDoc, { followersCount: increment(1) }, { merge: true });
    }
    try {
      await batch.commit();
      setIsFollowing(!isFollowing);
      setProfile((prev) => ({
        ...prev,
        followersCount: (prev?.followersCount || 0) + (isFollowing ? -1 : 1),
      }));
    } catch (err) {
      console.error("Follow toggle failed", err);
      setError("Could not update follow status right now.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="warning">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Profile Header Card */}
      <div className="profile-header-card bg-white rounded-4 shadow-sm p-4 mb-5 text-center position-relative overflow-hidden">
        <div
          className="position-absolute top-0 start-0 w-100"
          style={{ height: "6px", background: "linear-gradient(90deg, #0d6efd, #6610f2)" }}
        ></div>

        <div className="d-flex flex-column align-items-center">
          <div className="mb-3 position-relative">
            <img
              src={profile?.avatar || "/favicon.ico"}
              alt={profile?.username || "User"}
              className="rounded-circle border border-3 border-white shadow-sm"
              style={{ width: 120, height: 120, objectFit: "cover" }}
            />
          </div>

          <h1 className="h3 fw-bold mb-1">{profile?.username || "Creator"}</h1>
          <p className="text-muted mb-3 small">
            Digital Creator • Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
          </p>

          <div className="d-flex gap-4 justify-content-center mb-4">
            <div className="text-center">
              <div className="fw-bold h5 mb-0">{profile?.followersCount || 0}</div>
              <div className="text-muted small text-uppercase">Followers</div>
            </div>
            <div className="border-end"></div>
            <div className="text-center">
              <div className="fw-bold h5 mb-0">{profile?.followingCount || 0}</div>
              <div className="text-muted small text-uppercase">Following</div>
            </div>
          </div>

          {currentUser?.uid !== userId && (
            <Button
              variant={isFollowing ? "outline-secondary" : "dark"}
              className="px-4 rounded-pill fw-bold d-flex align-items-center gap-2"
              onClick={() => {
                if (!currentUser) {
                  alert("Please log in to follow creators.");
                  return;
                }
                toggleFollow();
              }}
              disabled={followLoading}
            >
              {isFollowing ? (
                <>
                  <i className="bi bi-person-check-fill"></i> Following
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i> Follow
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <h3 className="h5 mb-3 fw-bold ps-2 border-start border-4 border-primary">Visible palettes</h3>
      {palettes.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <i className="bi bi-palette display-4 text-muted mb-3 d-block"></i>
          <p className="text-muted lead mb-0">No public palettes yet.</p>
          <p className="small text-muted">Check back later or follow this creator to get notified.</p>
        </div>
      ) : (
        <Row className="g-3">
          {palettes.map((palette) => (
            <Col xs={12} md={6} lg={4} key={palette.id}>
              <div className="pp-card h-100 shadow-sm border-0">
                <div className="pp-card-body">
                  <div className="pp-card-head">
                    <div className="pp-palette-name mb-0 fw-bold">{palette.name || "Palette"}</div>
                    <div className="d-flex gap-1 align-items-center">
                      <button
                        className="pp-open-generator border-0 bg-transparent p-1 bg-hover-light rounded"
                        onClick={() => handleOpen(palette)}
                        title="Open in Palette Generator"
                      >
                        <img src="/favicon.ico" alt="Open" width="18" height="18" />
                      </button>
                    </div>
                  </div>

                  <div className="pp-color-strip rounded mb-3 flow-hidden">
                    {(palette.colors || []).map((color, idx) => (
                      <div
                        key={idx}
                        className="pp-color-swatch"
                        style={{ backgroundColor: color }}
                        title="Click to copy hex"
                        onClick={() => navigator.clipboard.writeText(color)}
                      />
                    ))}
                  </div>

                  <div className="pp-actions border-top pt-2 mt-auto">
                    <button
                      className="pp-action-ghost w-50 justify-content-center"
                      onClick={() => {
                        setSelectedPalette({
                          name: palette.name || "Palette",
                          colors: palette.colors || [],
                        });
                        setShowShare(true);
                      }}
                    >
                      <i className="bi bi-share-fill"></i>
                      <span>Share</span>
                    </button>
                    <button className="pp-action-ghost w-50 justify-content-center" onClick={() => handleOpen(palette)}>
                      <i className="bi bi-rocket-takeoff-fill"></i>
                      <span>Open</span>
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {selectedPalette && (
        <SharePalette
          show={showShare}
          onClose={() => setShowShare(false)}
          palette={selectedPalette}
        />
      )}
    </Container>
  );
};

export default PublicProfile;
