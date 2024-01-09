import express from "express";
import bodyParser from "body-parser";
import products from "./lessons.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

//GET the lessons
app.get('/lessons', (req,res) => {
    res.send(products);

});
//GET the lessons with their id
app.get('/lessons/:id', (req,res) => {
    const lessonsId = Number(req.params.id);

    const lessons = products.filter((lessons) => lessons.id === lessonsId);
    res.send(lessons);

});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});