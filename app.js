const express=require("express"); 
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();
app .use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
// var nextitem=["Arrays","strings","stack"];
// var workitems=[];
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
    name:String
};

const Item=mongoose.model("Item",itemsSchema);

  const item1=new Item({
    name:"Welcome to your todo list"
  })
  const item2=new Item({
    name:"hit the + button to add a new item."
  });
  const item3=new Item({
    name:"<---- hit this to delete an item"
  });
const defaultItems=[item1,item2,item3];

const ListSchema={
  name:String,
  items:[itemsSchema]
};

const List =mongoose.model("List",ListSchema);





app.get("/",function(req,res){
  
// var today=new Date();
// var options={
//     weekday:"long",
//     day:"numeric",
//     month:"long"
// };
// var day=today.toLocaleDateString("en-us",options);
Item.find({},function(err,foundItems){

 if(foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
        if(err){console.log(err);}
        else {console.log("successfully saved default items toString.");}
    });
    res.redirect("/");
 }
else 
{res.render("list",{listtitle:"Today",newlistitem:foundItems});}

});

});

app.get("/:customListName", function(req,res){
  // console.log(req.params.customListName);
  const customListName= _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName},function(err,foundList){
        if(err)console.log(err);
        else{
         if(!foundList)
         {
          // console.log("Doesn't exist !");
          const list=new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
         }
         else{
          // console.log("Exists!");
          res.render("list",{listtitle:foundList.name,newlistitem:foundList.items})
         }
        }
  })
  
 
 


});


app.post("/",function(req,res){
    //  var item=req.body.txt;
    //  if(req.body.list==="work list")
    //  {
    //     workitems.push(item);
    //     res.redirect("/work");
    //  }
    //  else{
    //     nextitem.push(item);
    //     res.redirect("/"); 
    //  }
     
    //  console.log(nextitem);
    // console.log(nextitem);
   
    const itemName= req.body.txt;
    const listName=req.body.list;
    const item= new Item({
      name:itemName
    });

     if(listName === "Today")
     {
      item.save();
      res.redirect("/");
     }
     else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
     }

       
    
});
    

app.get("/work",function(req,res){
    res.render("list",{listtitle:"work list",newlistitem:workitems});
})


app.post("/work",function(req,res){
    let item= req.body.txt;
       workitems.push(item);
       res.redirect("/work");
})

app.post("/delete",function(req,res){
   const checkedItemId= req.body.checkbox;
   const listName=req.body.listName;

   if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err)console.log(err);
      else
      {
        console.log("item deleted successfully");
        res.redirect("/");
      }
     });
     
   }

   else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
   }




  
});

app.listen(3000,function(){
    console.log("server started at port 3000");
});