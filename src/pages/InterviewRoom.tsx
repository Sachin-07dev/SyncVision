import { Navigate, useParams } from 'react-router-dom';
import CollabRoom from './CollabRoom';

const InterviewRoom = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/interviews" replace />;
  }

  return <CollabRoom />;
};

export default InterviewRoom;
