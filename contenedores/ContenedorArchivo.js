const { promises: fs } = require('fs')

class ContenedorArchivo {

    constructor(ruta) {
        this.ruta = ruta;
        this.id = 1;
    
    }

    async listar(id) {
        const products = await this.listarAll();
        const productById = products.find(p => p.id == id);
        if (productById) {
            return productById;
        }
        throw new Error('No se encontro el objeto con id', id);       
    }

    async listarAll() {
        try {
            const products = await fs.readFile(this.ruta, 'utf-8');
            return JSON.parse(products);
        } catch (error) {
    
            console.error("No hay nada en el archivo",error);
            return [];
        }
    }

    async guardar(newObject) {
        console.log('Inserting', newObject);
        
        let result = await this.listarAll();
        const lastId = await this.getIdMax() + 1;
    
        console.log('------------>',result);

        result.push({
            ...newObject,
            date: new Date().toLocaleString(),
            id: lastId    
        });
        await fs.writeFile(this.ruta, JSON.stringify(result,null,2));
        return result.id;
    }

    async getIdMax() {
         
        try{
              const fileData = await fs.readFile(this.ruta, 'utf-8');
              const products = JSON.parse(fileData);
              const lastElement = products[products.length - 1];
              return lastElement.id;
          }
          catch{
              console.log('ERROR AL OBTENER EL ULTIMO ID', this.ruta);
              return 0;
          }
  }

    async actualizar(prod, id) {
        //PUT
        const products = await this.listarAll();
        let lastElement = products[products.length - 1];
        let productById = products.find(p => p.id == id);
        if (lastElement.id >= productById.id) {
            productById.title = prod.title;
            productById.price = prod.price;
            productById.thumbnail = prod.thumbnail;
            productById.description = prod.description;
            productById.stock = prod.stock;
            await fs.writeFile(this.ruta, JSON.stringify(products,null,2));
            } else {
                throw new Error;
            }
    }

    async actualizarCarrito(carrito, producto) {
        //PUT
        const carritos = await this.listarAll();
        let carritoById = carritos.find(p => p.id == carrito.id);
        if (carritoById){
            carritoById.title = carrito.title;
            carritoById.productos.push(producto);
            await fs.writeFile(this.ruta, JSON.stringify(carritos,null,2));
            return;    
        }
        throw new Error('Error al actualizar carrito',carrito.id);
    }

    async actualizarGenerico(elemento) {
        //PUT
        const elementos = await this.listarAll();
        let elementoViejo = elementos.find(e => e.id == elemento.id);
        const position = elementos.indexOf(elementoViejo);
        elementos.splice(position, 1);
        elementos.push(elemento);
        await fs.writeFile(this.ruta, JSON.stringify(elementos,null,2));
        return; 
    }

    async saveProducts(id,product) {
        let carrito = await this.listar(id);
        carrito.productos.push(product);
        await fs.writeFile(this.ruta, JSON.stringify(carrito,null,2));
    }

    async borrar(productId) {
        const products = await this.listarAll();
        const productById = await products.find(element => element.id == productId);
        const position = await products.indexOf(productById);
        products.splice(position, 1);
        try {
            await fs.writeFile(this.ruta, JSON.stringify(products,null,2));
            console.log('Objeto eliminado!');
        } catch (error) {
            console.log('Error al eliminar el objeto');
        }
        
    }

    async borrarProductosCarrito(carritoId, productoId) {
        try {
            const carrito = await this.listar(carritoId);
            const producto = carrito.productos.find(p => p.id == productoId);
            if(!producto) {
                console.error('no hay producto')
                return;
            }
            const position = carrito.productos.indexOf(producto);
            carrito.productos.splice(position, 1);
            await actualizarGenerico(carrito);
            console.log('Objeto eliminado!');
        } catch (error) {
            console.log('Error al eliminar el objeto', error);
        }
        return;
    }

    async borrarAll(){
        const products = [];
        try {
            await fs.writeFile(this.ruta, JSON.stringify(products,null,2));
            console.log('Lista eliminada!');
        } catch (error) {
            console.log('Error al eliminar la lista');
        }
    }
}

module.exports = ContenedorArchivo