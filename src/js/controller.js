import 'core-js/stable';
import { async } from 'regenerator-runtime';
import 'regenerator-runtime/runtime';
import * as model from './model';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultView from './views/resultView';
import paginationView from './views/paginationView';
import bookmarkView from './views/bookmarkView';
import addRecipeView from './views/addRecipeView';
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }
//Recipe controller

const controllRecipes = async function () {
  try {
    //spinner rendering
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    //fetching the data
    await model.loadRecipe(id);
    // Rendering the recipe
    recipeView.render(model.state.recipe);
    //update result view to mark selected result
    resultView.update(model.getSearchResultPage());
    //update bookmark view to mark
    bookmarkView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};
controllRecipes();

// search contoller

const controllSearchedRecipe = async function () {
  try {
    // Get query from search input
    const query = searchView.getQuery();
    if (!query) return;
    // fetch the query recipe from model function
    await model.loadSearchResult(query);
    // rendering spinner
    resultView.renderSpinner();
    // Rendering result query on page
    // resultView.render(model.state.search.results);
    resultView.render(model.getSearchResultPage(1));
    // Render pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

// pagination controller
const controllPagination = function (gotoPage) {
  // rendering new page
  resultView.render(model.getSearchResultPage(gotoPage));
  // Render new pagination buttons
  paginationView.render(model.state.search);
};

// controller for servings
const controlServings = function (newServing) {
  // update state with new quantity
  model.updateServings(newServing);
  // update view with new quantity
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

// control add bookmark
const controlAddBookmark = function () {
  // Add and remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  console.log(model.state.recipe);
  // update recipe area
  recipeView.update(model.state.recipe);
  //render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarkLoad = function () {
  bookmarkView.render(model.state.bookmarks);
};
// upload new recipe data to api
const controlAddRecipe = async function (newRecipe) {
  try {
    //show spinner
    addRecipeView.renderSpinner();
    //upload new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // update new recipe
    recipeView.render(model.state.recipe);
    // render bookmark view
    bookmarkView.render(model.state.bookmarks);
    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //success message
    addRecipeView.renderSuccessMessage();

    // closing form after some time
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.log(error);
    addRecipeView.renderError(error.message);
  }
};
// passing controllSearchedRecipe function to searchView
// listening hash and load event
function init() {
  recipeView.addHandlerRender(controllRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controllSearchedRecipe);
  paginationView.addHandlerClick(controllPagination);
  bookmarkView.addLoadHandler(controlBookmarkLoad);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
// window.addEventListener('hashchange', controllRecipes);
