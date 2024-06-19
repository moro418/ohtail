import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import style from "../../styles/myRecipe/CreateMyRecipe.module.css";

const EditMyRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "옵션1" },
  ]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    const fetchMyRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:8080/myRecipe/${id}`);
        if (!response.ok) {
          throw new Error("레시피를 가져오는 중 오류 발생!!!!!");
        }
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setFiles(data.files);
        setIngredients(data.ingredients);
        setInstructions(data.instructions);
      } catch (error) {
        console.error("레시피를 가져오는 중 오류 발생!!!!!", error);
      }
    };

    fetchMyRecipe();
  }, [id]);

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    if (title === "") {
      alert("칵테일 이름 필수!!!!!!!!!!");
      return;
    }

    if (description === "") {
      alert("칵테일 소개 필수!!!!!!!!!!");
      return;
    }

    if (files.length === 0 && newFiles.length === 0) {
      alert("이미지 업로드 필수!!!!!!!!!!");
      return;
    }

    if (
      ingredients.some(
        (ingredient) =>
          ingredient.name === "" ||
          ingredient.quantity === "" ||
          ingredient.unit === ""
      )
    ) {
      alert("재료 필드 입력 필수!!!!!!!!!!");
      return;
    }

    if (instructions === "") {
      alert("만드는 방법 입력 필수!!!!!!!!!!");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    newFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.set(
      "existingFiles",
      JSON.stringify(files.filter((file) => !removedFiles.includes(file)))
    );
    formData.set("removedFiles", JSON.stringify(removedFiles));
    ingredients.forEach((ingredient, index) => {
      formData.append(`ingredient_${index}_name`, ingredient.name);
      formData.append(`ingredient_${index}_quantity`, ingredient.quantity);
      formData.append(`ingredient_${index}_unit`, ingredient.unit);
    });
    formData.set("instructions", instructions);

    try {
      const response = await fetch(`http://localhost:8080/myRecipe/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate(`/myRecipe/${id}`);
      } else {
        const errorData = await response.json();
        console.error("수정 요청 실패:", errorData);
        throw new Error(errorData.message || "수정 중 오류 발생!!!!!");
      }
    } catch (error) {
      console.error("수정 중 오류 발생!!!!!", error);
      alert(error.message);
    }
  };

  const handleFileChange = (e) => {
    const newAddedFiles = Array.from(e.target.files);
    if (newFiles.length + newAddedFiles.length <= 3) {
      setNewFiles([...newFiles, ...newAddedFiles]);
    } else {
      alert("이미지는 최대 3장까지만");
    }
  };

  const handleRemoveFile = (index, isExistingFile) => {
    if (isExistingFile) {
      const fileToRemove = files[index];
      setRemovedFiles([...removedFiles, fileToRemove]);
      setFiles(files.filter((_, i) => i !== index));
    } else {
      setNewFiles(newFiles.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "옵션1" }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <main className="mw">
      <h2>레시피 수정</h2>
      <form className={style.recipeCon} onSubmit={handleUpdateRecipe}>
        <label htmlFor="title">칵테일 이름</label>
        <input
          type="text"
          name="title"
          id="title"
          className={style.inputField}
          placeholder="칵테일 이름"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="description">칵테일 소개</label>
        <input
          type="text"
          name="description"
          id="description"
          className={style.inputField}
          placeholder="칵테일 소개"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label htmlFor="files">이미지</label>
        <input
          type="file"
          name="files"
          accept="image/*"
          id="files"
          onChange={handleFileChange}
          multiple
        />
        <div className={style.imagePreview}>
          {files.map((file, index) => (
            <div key={index} className={style.imageContainer}>
              <img
                src={`http://localhost:8080/${file}`}
                alt={`Preview ${index}`}
                className={style.previewImage}
                onClick={() => handleRemoveFile(index, true)}
              />
            </div>
          ))}
          {newFiles.map((file, index) => (
            <div key={index} className={style.imageContainer}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview new ${index}`}
                className={style.previewImage}
                onClick={() => handleRemoveFile(index, false)}
              />
            </div>
          ))}
        </div>

        <label htmlFor="ingredients">재료</label>
        {ingredients.map((ingredient, index) => (
          <div key={index}>
            <input
              type="text"
              name={`ingredient-name-${index}`}
              id={`ingredient-name-${index}`}
              placeholder="재료명"
              value={ingredient.name}
              onChange={(e) =>
                handleIngredientChange(index, "name", e.target.value)
              }
            />
            <input
              type="number"
              name={`ingredient-quantity-${index}`}
              id={`ingredient-quantity-${index}`}
              placeholder="수량"
              value={ingredient.quantity}
              onChange={(e) =>
                handleIngredientChange(index, "quantity", e.target.value)
              }
            />
            <select
              name={`ingredient-unit-${index}`}
              id={`ingredient-unit-${index}`}
              value={ingredient.unit}
              onChange={(e) =>
                handleIngredientChange(index, "unit", e.target.value)
              }
            >
              <option value="옵션1">옵션1</option>
              <option value="옵션2">옵션2</option>
              <option value="옵션3">옵션3</option>
            </select>
            <button
              type="button"
              onClick={() => handleRemoveIngredient(index)}
              disabled={ingredients.length === 1}
            >
              제거
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddIngredient}>
          재료 추가
        </button>

        <label htmlFor="instructions">만드는 방법</label>
        <textarea
          name="instructions"
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        ></textarea>

        <button type="submit">레시피 수정</button>
      </form>
    </main>
  );
};

export default EditMyRecipe;