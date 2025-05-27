import styled from 'styled-components';

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #0c0c0c;
  color: white;
  padding: 1rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

const Center = styled.nav`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;

  a {
    color: white;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }
  }
`;

const Right = styled.div``;

const LoginButton = styled.button`
  background: white;
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f3f3f3;
  }
`;

function Header() {
  return (
    <HeaderWrapper>
      <Left>
        <img src="/studybuddy_logo.png" alt="Logo" style={{ height: '32px' }} />
        StudyBuddy
      </Left>

      <Center>
        <NavList>
          <li><a href="#">Download</a></li>
          <li><a href="#">Match</a></li>
          <li><a href="#">Learn</a></li>
          <li><a href="#">Events</a></li>
          <li><a href="#">International</a></li>
          <li><a href="#">Safety</a></li>
          <li><a href="#">Support</a></li>
        </NavList>
      </Center>

      <Right>
        <LoginButton>Log In</LoginButton>
      </Right>
    </HeaderWrapper>
  );
}

export default Header;