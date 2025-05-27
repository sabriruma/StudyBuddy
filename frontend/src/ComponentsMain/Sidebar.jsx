import styled from 'styled-components';
import { FaBook, FaTrophy, FaUser, FaStore, FaQuestionCircle, FaListUl, FaEllipsisH, FaRobot, FaUserFriends, FaCalendarAlt, FaComments, FaSignOutAlt } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';

function Sidebar() {
  return (
    <SidebarWrapper>
      <Logo>
       <img src="/studybuddy_logo.png" alt="StudyBuddy Logo" />
      </Logo>

      <NavItem>
        <FaUserFriends />
        <span>Match</span>
      </NavItem>
      <NavItem>
        <FaRobot />
        <span>AI Tutor</span>
      </NavItem>
      <NavItem>
        <FaCalendarAlt />
        <span>Scheduele</span>
      </NavItem>
      <NavItem>
        <FaListUl />
        <span>Quests</span>
      </NavItem>
      <NavItem>
        <FaComments />
        <span>Messages</span>
      </NavItem>
      <NavItem>
        <FaTrophy />
        <span>Leaderboards</span>
      </NavItem>
      <NavItem>
        <FaUser />
        <span>Profile</span>
      </NavItem>
      <NavItem>
        <HiOutlineDotsHorizontal />
        <span>More</span>
      </NavItem>
      <NavItem>
        <FaSignOutAlt />
        <span>Log Out</span>
      </NavItem>
    </SidebarWrapper>
  );
}

export default Sidebar;

// Styled Components
const SidebarWrapper = styled.div`
  background-color: #1f1f1f;
  color: white;
  width: 80px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  gap: 2rem;
`;

const Logo = styled.div`
  width: 46px;
  height: 46px;
  margin-bottom: -0.5rem;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: #ccc;
  transition: all 0.2s ease;

  span {
    font-size: 0.7rem;
    margin-top: 0.3rem;
  }

  &:hover {
    color: #ffffff;
    transform: scale(1.1);
  }
`;