const express = require('express')
const { Router } = express

const ContenedorArchivo = require('./contenedores/ContenedorArchivo.js')

//--------------------------------------------
// instancio servidor y persistencia

const app = express()
const productosApi = new ContenedorArchivo('dbProductos.json')
const carritosApi = new ContenedorArchivo('dbCarrito.json')
app.set('views','./views');
module.exports = app
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

//CHEQUEAR
app.get('/', (req, res) => {
    res.sendFile('/public/productos.html', { root: __dirname });
});

app.get('/', (req, res) => {
    res.sendFile('/public/carrito.html', { root: __dirname });
});
//HASTA ACA

//--------------------------------------------
// permisos de administrador

const esAdmin = true

function crearErrorNoEsAdmin(ruta, metodo) {
    const error = {
        error: -1,
    }
    if (ruta && metodo) {
        error.descripcion = `ruta '${ruta}' metodo '${metodo}' no autorizado`
    } else {
        error.descripcion = 'no autorizado'
    }
    return error
}

function soloAdmins(req, res, next) {
    if (!esAdmin) {
        res.json(crearErrorNoEsAdmin())
    } else {
        next()
    }
}

//--------------------------------------------
// configuro router de productos

const productosRouter = new Router()
/*
productosRouter.post('/', soloAdmins, async (req, res) => {
    
})*/

productosRouter.get('/', async (req, res) => {
    try {
        const producto = await productosApi.listarAll();
        res.json({producto: producto});
    } catch (error) {
        res.json(`Error al buscar la lista de productos`)
    }
});

productosRouter.get('/:id', async (req, res) => {
    try {
        id = req.params.id;
        const producto = await productosApi.listar(id);
        res.json({producto: producto});
    } catch (error) {
        res.json(`Error al buscar el id: ${id}, producto no encontrado`)
    }
});

productosRouter.post('/', soloAdmins, async (req, res) => {
    const producto = {
        title: req.body.title,
        date: new Date(),
        // TODO: Mirar despues
    };
    productosApi.guardar(producto)
    res.status(200);

});

productosRouter.put('/:id', soloAdmins, async (req, res) => {
    try {
        id = req.params.id;
        await productosApi.actualizar(req.body, parseInt(id));
        console.log("objeto a guardar",req.body);
        res.status(200);
    } catch (error) {
        res.json(`Error al buscar el id: ${id}, producto no encontrado`)
    }
    
});

productosRouter.delete('/:id', soloAdmins, async (req, res) => {
    try {
        id = req.params.id;
        console.log(id);
        await productosApi.borrar(parseInt(id));
        res.status(200);
    } catch (error) {
        res.json(`Error al buscar el id: ${id}, producto no encontrado`)
    }
    
});

//--------------------------------------------
// configuro router de carritos

const carritosRouter = new Router()

carritosRouter.post('/', (req, res) => {
    const carrito = {
        title: req.body.title, // TODO: eliminar title 
        productos: []
    };
    const productoId = carritosApi.guardar(carrito)
    res.status(200);
    return productoId;
});

carritosRouter.get('/', async (req, res) => {
    try {
        const carritos = await carritosApi.listarAll();
        res.json({carritos:carritos});
    } catch (error) {
        res.json(`Error al buscar la lista de carritos`)
    }
});

carritosRouter.delete('/:id', async (req, res) => {
    try {
        id = req.params.id;
        console.log(id);
        await carritosApi.borrar(parseInt(id));
        res.status(200);
    } catch (error) {
        res.json(`Error al buscar el id: ${id}, producto no encontrado`)
    }
});

carritosRouter.get('/:id/productos', async (req, res) => {
    try {
        id = req.params.id;
        const carrito = await carritosApi.listar(id);
        res.json({carrito: carrito});
    } catch (error) {
        res.json(`Error al buscar el id: ${id}, producto no encontrado`)
    }
});

carritosRouter.post('/:carritoId/productos', async (req, res) => {
    try {
        const carritoId = req.params.carritoId;
        const nuevoProductoId = req.body.productoId;
        const nuevoProducto = await productosApi.listar(nuevoProductoId);
        const carrito = await carritosApi.listar(carritoId);
        const carritoActualizado = carritosApi.actualizarCarrito(carrito, nuevoProducto);
        res.json(carritoActualizado);
        res.status(200);
    } catch (error) {
        console.log(error);
        res.status(400);
    }
});

carritosRouter.delete('/:id/productos/:id_prod', soloAdmins, async (req, res) => {
    try {
        const id_carrito = req.params.id;
        const id_producto = req.params.id_prod;
        await carritosApi.borrarProductosCarrito(parseInt(id_carrito, id_producto));
        res.status(200);
    } catch (error) {
        res.json(`Error al buscar el id: ${id}, producto no encontrado`)
    }
    
});


//--------------------------------------------
// configuro el servidor

app.use('/api/productos', productosRouter)
app.use('/api/carritos', carritosRouter)


const PORT = 8080
const server = app.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
})
server.on("error", error => console.log(`Error en servidor ${error}`))