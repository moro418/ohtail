import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLikeStatus, toggleLikeStatus } from '../../store/likeSlice';

const LikeButton = ({ cocktailId, userId }) => {
  const dispatch = useDispatch();
  const liked = useSelector((state) => state.likes.liked);
  
  useEffect(() => {
    dispatch(fetchLikeStatus({ cocktailId, userId }));
  }, [dispatch, cocktailId, userId]);

  const handleToggleLike = () => {
    dispatch(toggleLikeStatus({ cocktailId, userId, liked: !liked }));
  };

  return (
    <button onClick={handleToggleLike}>
      {liked ? 'Unlike' : 'Like'}
    </button>
  );
};

export default LikeButton;
