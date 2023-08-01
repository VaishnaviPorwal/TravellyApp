//Backend Configuration and Middleware Setup
import express  from "express"; 
import bodyParser from "body-parser"; // to process request body
import mongoose from "mongoose"; // for password encryption
import cors from "cors"; // for cross-origin request
import dotenv from "dotenv"; // for environment variables
import multer from "multer"; // to upload file locally
//import helmet from "helmet"; // for request safety
import morgan from "morgan"; // for login
import {register} from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import { verifyToken } from "./middleware/auth.js";
import {createPost} from "./controllers/post.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import {users, posts} from "./data/index.js";

//Inbuilt Modules
import path from "path";
import { fileURLToPath } from "url";

//Middleware Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
//app.use(helmet());
//app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({
    unit: "30 mb",
    extended: true
}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

//File Storage
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/assets");
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage});

//Routes with files
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

//Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/posts", postRoutes);

//Mongoose Setup
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    app.listen(PORT, ()=> console.log(`Server Port: ${PORT}`));

    /*ADD DATA ONE TIME*/
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((error)=>{
    console.log(`${error} : didn't connect`);
})

