import styled from 'styled-components';
import { motion } from 'framer-motion';

const Section = styled.div`
  width: 100vw;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
`;

const Row = styled.div`
  background-color: ${({ $alt }) => ($alt ? '#151824' : '#1c1f2b')};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 6vw;
  box-sizing: border-box;
  flex-direction: ${({ $reverse }) => ($reverse ? 'row-reverse' : 'row')};
`;

const Text = styled.div`
  flex: 1;
  max-width: 500px;

  h2 {
    font-size: 2.2rem;
    color: #00bfa5;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #d1d5db;
  }
`;

const Img = styled.img`
  width: 40%;
  max-width: 500px;
  flex: 1;
  object-fit: contain;
`;

function Body() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Row>
          <Text>
            <h2>study. connect. grow.</h2>
            <p>
              With StudyBuddy, matching with the right academic partner is fun and rewarding.
              Earn XP for consistency, and unlock new badges as you build better study habits!
            </p>
          </Text>

          <Img src="/SBmascot.png" alt="Leaderboard" />
        </Row>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Row $alt $reverse>
          <Text>
            <h2>backed by purpose</h2>
            <p>
              Our AI-driven matching is based on learning styles, academic interests, and study behavior
              not popularity. We help you level up <em>your way</em>!
            </p>
          </Text>
          <Img src="/SBmascotR.png" alt="Research" />
        </Row>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Row>
          <Text>
            <h2>progress made visible</h2>
            <p>
              Track your study streak, XP, and milestones with a gamified dashboard.
              Your academic progress has never looked this good or this motivating.
            </p>
          </Text>
          <Img src="/SBmascotG.png" alt="Dashboard" />
        </Row>
      </motion.div>
    </Section>
  );
}

export default Body;