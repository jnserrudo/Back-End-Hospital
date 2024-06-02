import { getRandomInt } from "../../app.js"

/*import {dotenv} from "dotenv"
dotenv.config()*/
const API_URL=process.env.API_URL
const API_KEY=process.env.API_KEY
const IMAGE_PATH=process.env.IMAGE_PATH
export class MovieRepository{

    static getMovies=async(page)=>{
        console.log("getMovies desde el Repository")
        
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=1`)
        const movies=await res.json()
        console.log(movies)
        return movies
    }

    static getMoviesToCarrusel=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getAllMovies=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesProximas=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesToCarrusel=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesEstrenos=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesVentasAnticipadas=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMovies2D=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMovies3D=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMovies4D=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesXD=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesDBOX=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesPremiumClass=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesConfort=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }

    static getMoviesProximamente=async()=>{
        let pag=getRandomInt(500)//cantidad de paginas q da la api(al probar con 41653(que era lo que me decia que habia me dio un error diciendo que debe ser menor a 500) )
        console.log("getMovies desde el Repository")
        const res=await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&page=${pag}`)
        const movies=await res.json()
        return movies
    }
}