import Favorite from "../model/Favorite.js";

export const getAllFavoriteList = async (userID) => {
  return await Favorite.find({ idDocGia: userID }).populate("idSach");
};

export const addFavorite = async (userID, bookID) => {
  let favorite = await Favorite.findOne({
    //check maybe already in favorite list
    idDocGia: userID,
    idSach: bookID,
  });

  if (!favorite) {
    //if not exist, create new favorite entry else dont do anything
    favorite = new Favorite({
      idDocGia: userID,
      idSach: bookID,
      soLuong: 1, // Default quantity to add to favorites
    });
  }
  return await favorite.save();
};

export const updateFavorite = async (userID, bookID, soLuong) => {
  const favorite = await Favorite.findOne({
    idDocGia: userID,
    idSach: bookID,
  });
  if (!favorite) {
    throw new Error("Favorite not found");
  }
  favorite.soLuong = soLuong;
  return await favorite.save();
};

export const deleteFavorite = async (userID, bookID) => {
  return await Favorite.findOneAndDelete({
    idDocGia: userID,
    idSach: bookID,
  });
};
