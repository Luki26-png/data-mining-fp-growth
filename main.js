const {mineData} = require('./algorithm')
const express = require('express');
const multer = require('multer');
const app = express();
const PORT = 54540;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './upload');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
  
const upload = multer({ storage: storage })

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static('./public'));

app.get('/',(req, res)=>{});

app.post('/mine-data', upload.single('dataset'),(req, res)=>{
    const result = mineData(req.body.minSupport, req.file.originalname);
    res.json(result);
});

app.listen(PORT, ()=>{
    console.log(`app is listening to http://localhost:${PORT}`);
});