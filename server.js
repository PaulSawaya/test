const express = require('express')

const app = express()
app.use(express.json()) // to parse JSON bodies


let database = [
    {
        first_name: "Paul",
        last_name: "Sawaya",
        age: 21
    },

    {
        first_name: "Elie",
        last_name: "Sawma",
        age: 29
    },

    {
        first_name: "Charbel",
        last_name: "Khoury",
        age: 70
    }
]


app.get("/hello", (req,res) => {
    res.send("hello")
})

app.get("/users", (req,res) => {
    let names = ""

    for (let person of database){
        names = names + person.first_name + "\n"
    }

    res.send(names)

})

app.get("/users/:first_name", (req, res) => {
  const person = database.find(p => p.first_name.toLowerCase() === req.params.first_name.toLowerCase())

  if (person) {
    res.json(person)
  } else {
    res.status(404).send("User not found")
  }
})

app.get("/olderThan/:age", (req, res) => {
  const age = parseInt(req.params.age)
  const filtered = database.filter(p => p.age > age)
  res.json(filtered)
})

app.post("/users", (req, res) => {
  const { first_name, last_name, age } = req.body

  if (!first_name || !last_name || !age) {
    return res.status(400).send("Missing fields")
  }

  database.push({ first_name, last_name, age })
  res.send("User added successfully")
})



app.listen(3000)

