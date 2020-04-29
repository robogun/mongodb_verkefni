const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
// const mongo = require('mongodb').MongoClient;

var port = process.env.PORT || 3000 // Skilgreinum port
var dburl = "mongodb://127.0.0.1/";

// gerum breytu sem geymir fjölda notenda
var fjoldi_notenda = 0;
// gerum fylki sem geymir notendanöfn
var notendur = [];

app.get('/', function(req, res)
{
	res.sendFile(__dirname+'/login.html');
});

app.get('/12345', function(req, res)
{
	res.sendFile(__dirname+'/index.html');
});

// skrifum aðra leið fyrir routerinn
app.get('/*', function(req, res)
{
    res.write('Rangt lykilorð!');
    res.end();
});

// function chatlog()
// {
//     mongo.connect(dburl, function(err, db)
//     {
//         if (err) throw err;
//         var dbo = db.db("mongodb_chat");
//         dbo.collection("messages").find({}, { projection: { _id: 0, msg: 1 } }).toArray(function(err, result)
//         {
//             if (err) throw err;
//             console.log(result[2].msg);
//             db.close();
//         });
//     });
// };

// mongo.connect('mongodb://127.0.0.1/', {useUnifiedTopology: true}, function(err, db)
// {
//     if (err)
//     {
//         throw err;
//     }
//     var chatdb = db.db("mongodb_chat");
//     // hlustum eftir connection atburð á servernum og
//     // skrifum svarfall fyrir þann atburð

    io.on('connection', function(socket)
    {
        console.log('a new user has connected');
        // hækkum fjöldi_notenda úr því nýr maður er kominn inn
        fjoldi_notenda++;
        console.log(fjoldi_notenda);
        // látum clientinn vita að fjoldi_notenda hafi breyst, client þarf þá að hlusta 
        // eftir 'count' atburði og gera eitthvað við breytuna sem við sendum honum, sem sagt
        // láta hana sjást einhversstaðar
        io.emit('count', fjoldi_notenda);
        
        socket.on('join', function(nick, msg)
        {
            socket.userName = nick;
            // bætum nafninu við fylkið okkar
            notendur.push(nick);
///////////////////////////////////////////////////////////////////////////////////////////////
            io.emit('join',msg, socket.userName);



            io.emit('nafn', nick);
///////////////////////////////////////////////////////////////////////////////////////////////


            // látum alla clienta hafa fylkið okkar í núverandi mynd
            io.emit('users_logged_in', notendur);
            // chatlog();
        });

        socket.on('disconnect', function(nick, msg)
        {
            console.log('A user has disconnected');
            // lækkum fjöldi_notenda úr því einn maður er farinn út
            fjoldi_notenda--;

            io.emit('disconnect',msg, socket.userName);//ekki færa röð skiftir miklu máli
            // socket.userName = nick;

            //////////////////////////////////////////////////////////////////////7
            // látum clientinn vita að fjoldi_notenda hafi breyst, client þarf þá að hlusta 
            // eftir 'count' atburði og gera eitthvað við breytuna sem við sendum honum, 
            // sem sagt láta hana sjást einhversstaðar
            io.emit('count', fjoldi_notenda);
            // fjarlægjum þann notanda sem var að fara úr fylkinu okkar
            // að því gefnu að notandi hafi verið búinn að fá notendanafn (annað á ekki að geta gerst, en við 
            // gerum þetta svona bara til öryggis)
            if (socket.userName != undefined)
            {
                // finnum númer notandans í fylkinu okkar með indexOf
                var numer_notanda = notendur.indexOf(socket.userName);
                // indexOf skilar -1 ef það sem leitað er að finnst ekki
                if (numer_notanda != -1)
                {
                    notendur.splice(numer_notanda, 1);
                }
                // þetta hefði líka mátt gera með for lykkju eins og sést hér að neðan
                /*
                for (var i=0; i<notendur.length; i++){
                    // ef nafnið finnst ...
                    if (notendur[i] == socket.userName) {
                        // þá fjarlægjum við það
                        notendur.splice(i, 1);
                    }
                }
                */
            }
            // látum alla clienta hafa fylkið okkar í núverandi mynd
            io.emit('users_logged_in', notendur);
            console.log(fjoldi_notenda);
        });
        socket.on('chat message', function(msg)
        {
            chatdb.collection("messages").insertOne({msg:socket.userName + ': ' + msg});
            io.emit('chat message', msg, socket.userName);
        });
    });
// });

http.listen(port, function()
{
	console.log('Server is listening on port: ' + port);
});

