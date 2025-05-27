import styled from 'styled-components';
import Sidebar from './components/Sidebar.jsx';
import PromptBox from './components/PromptBox.jsx';

function Tutor() {
  return (
    <PageWrapper>
      <Sidebar />
      <PromptBox />
    </PageWrapper>
    
  );
}

export default Tutor;

// Layout
const PageWrapper = styled.div`
  display: flex;
  background-color: #363737;
  min-height: 100vh;
  color: white;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
`;