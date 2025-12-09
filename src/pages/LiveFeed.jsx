import React from "react";
import { Container } from "react-bootstrap";
import CommunityFeed from "../components/CommunityFeed";
import SEO from "../components/SEO";

const LiveFeed = () => {
  return (
    <>
      <SEO
        title="Live Community Feed"
        description="Browse the latest public palettes from the DigiSwatch community."
        url="/feed"
      />
      <Container className="py-4">
        <CommunityFeed />
      </Container>
    </>
  );
};

export default LiveFeed;
