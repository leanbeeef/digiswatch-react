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
      <div className="d-flex align-items-center gap-3 mb-4 justify-content-between">
        <img
          src={profile?.avatar || "/favicon.ico"}
          alt={profile?.username || "User"}
          className="rounded-circle border"
          style={{ width: 72, height: 72, objectFit: "cover" }}
          />
        <div>
          <h2 className="h4 mb-1">{profile?.username || "Creator"}</h2>
          <div className="text-muted small d-flex gap-3 flex-wrap">
            <span>{profile?.followersCount || 0} followers</span>
            <span>{profile?.followingCount || 0} following</span>
          </div>
        </div>
        {currentUser && currentUser.uid !== userId && (
          <div className="ms-auto">
            <Button
              variant={isFollowing ? "outline-danger" : "primary"}
              onClick={toggleFollow}
              disabled={followLoading}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          </div>
        )}
      </div>

      <h3 className="h5 mb-3">Visible palettes</h3>
      {palettes.length === 0 ? (
        <Alert variant="light">No public palettes yet.</Alert>
      ) : (
        <Row className="g-3">
          {palettes.map((palette) => (
            <Col xs={12} md={6} lg={4} key={palette.id}>
              <div className="pp-card h-100">
                <div className="pp-card-body">
                  <div className="pp-card-head">
                    <div className="pp-palette-name mb-0">{palette.name || "Palette"}</div>
                    <div className="d-flex gap-1 align-items-center">
                      <Badge bg="light" text="dark">
                        Public
                      </Badge>
                      <button
                        className="pp-open-generator"
                        onClick={() => handleOpen(palette)}
                        title="Open in Palette Generator"
                      >
                        <img src="/favicon.ico" alt="Open" width="18" height="18" />
                      </button>
                    </div>
                  </div>

                  <div className="pp-color-strip">
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

                  <div className="pp-actions">
                    <button
                      className="pp-action-ghost"
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
                    <button className="pp-action-ghost" onClick={() => handleOpen(palette)}>
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
