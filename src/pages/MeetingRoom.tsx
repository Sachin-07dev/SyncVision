import { Navigate, useParams } from 'react-router-dom';
import CollabRoom from './CollabRoom';

const MeetingRoom = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/meetings" replace />;
  }

  return <CollabRoom />;
};

export default MeetingRoom;
