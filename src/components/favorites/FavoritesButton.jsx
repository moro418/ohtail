import React, { useState, useEffect } from "react";

const FavoritesButton = ({ cocktailId, userId, isExternal = false }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = "http://localhost:8080/favorites";
        if (token) {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (Array.isArray(data)) {
            console.log("즐겨찾기 데이터", data);
            const favorited = data.some(
              (favorite) =>
                favorite.cocktailId === cocktailId &&
                favorite.isExternal === isExternal
            );
            console.log("즐겨찾기 상태", favorited);
            setIsFavorited(favorited);
            setLoaded(true);
          } else {
            console.error("응답 형식 오류!!!", data);
          }
        } else {
          setLoaded(true);
        }
      } catch (error) {
        console.error("오류 발생!!!", error);
      }
    };

    checkFavorite();
  }, [cocktailId, isExternal]);

  const handleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("로그인 유저만 이용할 수 있습니다");
      alert("로그인 유저만 이용할 수 있습니다"); // 사용자에게도 알림
      return;
    }

    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch("http://localhost:8080/favorite", {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cocktailId, userId, isExternal }),
      });
      if (response.ok) {
        console.log("토글 성공!!!");
        setIsFavorited(!isFavorited);
      } else {
        const errorData = await response.json();
        console.error("토글 오류!!!", errorData.message);
      }
    } catch (error) {
      console.error("즐겨찾기 중 토글 오류!!!", error);
    }
  };

  if (!loaded) {
    return <button disabled>불러오는 중</button>;
  }

  return (
    <button onClick={handleFavorite}>
      {isFavorited ? "즐겨찾기 취소" : "즐겨찾기"}
    </button>
  );
};

export default FavoritesButton;
