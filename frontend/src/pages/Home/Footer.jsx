import styled from 'styled-components';

const FooterContainer = styled.footer`
  color: var(--text-color);
  font-size: 0.9rem;
`;

export default function Footer() {
  return (
    <FooterContainer>
      <p>&copy; {new Date().getFullYear()} StudyBuddy</p>
    </FooterContainer>
  );
}