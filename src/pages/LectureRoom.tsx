import { Navigate, useParams } from 'react-router-dom';
import CollabRoom from './CollabRoom';

const LectureRoom = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/lectures" replace />;
  }

  return <CollabRoom />;
};

export default LectureRoom;
