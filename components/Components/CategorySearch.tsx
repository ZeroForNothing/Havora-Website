import { useEffect, useState } from "react";
import communityStyles from '../../styles/WindowTab/Community.module.css'
import { InputField } from "../fields/InputField";

const CategorySearch = ({socket,currentCategoryID,SetCurrentCategoryID, fetchPosts, ...props })=>{

    type CategoryList = {
        Category_ID: number,
        Category_Name: string,
        Category_Description: string,
    }

    const [categoryList,SetCategoryList] = useState(null)
    const [categoryListSuggestion,SetCategoryListSuggestion] = useState(null)
    const [categorySearch,SetCategorySearch] = useState('')
    const [currentCategoryName, SetCurrentCategoryName] = useState<string>(null);

    useEffect(()=>{
        if(!socket) return;
        socket.on('getCategoryList',(data)=>{
            if(!data) return;
            let catlist = data.categoryList ? JSON.parse(data.categoryList) : null
            let catlistSugg = data.categorySuggestionList ? JSON.parse(data.categorySuggestionList) : null
            SetCategoryList(catlist)
            SetCategoryListSuggestion(catlistSugg)
        })
        socket.on('getCategoryName',(data)=>{
            if(!data) return;
            SetCurrentCategoryName(data.categoryName)
        })
    },[socket])
    
    const handleCategorySearch = (e) => {
        e.preventDefault();
        let categoryName = e.target.value.trim();
        SetCategorySearch(categoryName);
        socket.emit('getCategoryList',{ categoryName })
    }
    const handleRemoveCategory = (e) => {
        e.preventDefault();
        SetCurrentCategoryID(1)
        SetCurrentCategoryName(null)
        if(!fetchPosts)return;  
        socket.emit('getTopPosts',{
            categoryID : null,
            name : null,
            code : null,
            page : 1
        })  
    }
    const handleSelectedCategory = (categoryID,categoryName) => {
        SetCurrentCategoryID(categoryID)
        SetCurrentCategoryName(categoryName.trim())
        SetCategoryList(null)
        SetCategoryListSuggestion(null);
        SetCategorySearch("");
        (document.getElementById("categorySearch") as HTMLInputElement).value = categoryName
        if(!fetchPosts)return;  
        socket.emit('getTopPosts',{
            categoryID : categoryID,
            name : null,
            code : null,
            page : 1
        })  
    }
    return (
        <div className={`${communityStyles.categoryContainer}`}>
            {
                currentCategoryID && currentCategoryID != 1 ? 
                <div className={`NavButton secondLayer ${communityStyles.removeCategory}`} onClick={()=>{
                    handleRemoveCategory
                    }}>
                      <span className={`bi bi-x`}></span>
                      <p>{currentCategoryName}</p>
                </div>
                : <InputField id="categorySearch" type="text" placeholder="Search for category type..." maxLength={150} icon={`search`}
                onKeyUp={handleCategorySearch} />
            }
            {
                categorySearch? 
                <div className={`baseLayer ${communityStyles.categoryListPicker}`}>
                {
                    categoryList ? categoryList.map((category)=>{
                        return (
                        <div key={category.Category_ID} className={`secondLayer ${communityStyles.categoryTypeDiv}`}
                        onClick={e=>{
                            e.preventDefault();
                            handleSelectedCategory(category.Category_ID ,category.Category_Name)
                        }}>
                            <div>{category.Category_Name}</div>
                            <p>{category.Category_Description}</p>
                        </div>
                        )
                    }) : <p className={`${communityStyles.notFound}`}>"{categorySearch}" was not found</p>
                }
                <div className={`${communityStyles.suggest}`}>Suggestions</div>
                {
                    categoryListSuggestion ? categoryListSuggestion.map((category)=>{
                        return (
                        <div key={category.Category_ID} className={`secondLayer ${communityStyles.categoryTypeDiv}`}
                        onClick={e=>{
                            e.preventDefault();
                            handleSelectedCategory(category.Category_ID,category.Category_Name)
                        }}>
                            <div>{category.Category_Name}</div>
                            <p>{category.Category_Description}</p>
                        </div>
                        )
                    }) : null
                }
                </div> : null
            }
        </div>
    )
}
export default CategorySearch;