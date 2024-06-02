import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { MovieRepository } from "../repository/movies.js";
import { getRandomInt } from "../../app.js";
const IMAGE_PATH = process.env.IMAGE_PATH;

//SE TIENE EN EL MODELO "COMO" SE HARAN ESTAS COSAS (LOGICA DE NEGOCIO)
//EN ESTE CASO COMO SE DEBEN FILTRAR CIERTAS COSAS

//se hace con una clase, porque es interesante que se tenga un contrato,
//esto nos ayudara a tipar perfectamente (cuando usemos TS) como tienen que ser nuestros modelos para que sean intercambiables

export class MovieModel {
  //el hecho que este metodo sea static esta mal, es sincrono, esto quiere decir que el modelo tratara con modelos sincronos
  //por lo que lo hacemos asincrono, teniendo un contrato en el cual todos devuelvan una promesa, aunque sepamos que la
  //implementacion es sincrona , cosa que en el caso que sea asincrono o no, a futuro sea compatible con todas las soluciones
  static getMovies = async (page) => {
    console.log("getMovies desde el MOdel");
    if (page) {
      const movies = await MovieRepository.getMovies();
      return movies;
    } else {
      //en el caso que no se eliga una page, se tomara la inicial
      const movies = await MovieRepository.getMovies();
      return movies;
    }
  };

  static getMoviesToCarrusel = async () => {
    const movies = await MovieRepository.getMoviesToCarrusel();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    while (i < 8) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    let portadas = movies?.results?.filter((m, index) =>
      nros_movies.includes(index)
    );
    portadas = portadas.map((m) => IMAGE_PATH + m.backdrop_path);

    return portadas;
  };


  static getAllMovies = async () => {
    const movies = await MovieRepository.getAllMovies();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    while (i < 8) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    let portadas = movies?.results?.filter((m, index) =>
      nros_movies.includes(index)
    );
    portadas = portadas.map((m) => IMAGE_PATH + m.backdrop_path);

    return portadas;
  };

  static getMoviesProximas = async () => {
    const movies = await MovieRepository.getMoviesProximas();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    while (i < 8) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    let portadas = movies?.results?.filter((m, index) =>
      nros_movies.includes(index)
    );
    portadas = portadas.map((m) => IMAGE_PATH + m.backdrop_path);

    return portadas;
  };

  

  static getMoviesEstrenos = async () => {
    let movies = await MovieRepository.getMoviesEstrenos();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }
    

    return movies;
  };



  static getMoviesVentasAnticipadas= async () => {
    let movies = await MovieRepository.getMoviesVentasAnticipadas();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMovies2D= async () => {
    let movies = await MovieRepository.getMovies2D();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMovies3D = async () => {
    let movies = await MovieRepository.getMovies3D();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMovies4D= async () => {
    let movies = await MovieRepository.getMovies4D();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMoviesXD= async () => {
    let movies = await MovieRepository.getMoviesXD();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMoviesDBOX= async () => {
    let movies = await MovieRepository.getMoviesDBOX();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMoviesPremiumClass= async () => {
    let movies = await MovieRepository.getMoviesPremiumClass();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMoviesConfort = async () => {
    let movies = await MovieRepository.getMoviesConfort();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  static getMoviesProximamente = async () => {
    let movies = await MovieRepository.getMoviesProximamente();
    console.log("model movies: " + movies);

    //console.log(movies.results,movies.results.length)
    let nros_movies = [];
    let i = 0;
    let maxCantPelis=getRandomInt(8);
    while (i < maxCantPelis) {
      //se hace esto para evitar que se repitan las pelis
      let nro_movie = getRandomInt(20);
      if (!nros_movies.includes(nro_movie)) {
        nros_movies.push(nro_movie);
        i++;
      }
    }
    console.log(nros_movies);
    if(movies?.results?.length>0){
        movies = movies.results.filter((m, index) => nros_movies.includes(index));
        movies = movies.map((movie) => {
          return {
            ...movie,
            urlFondo: IMAGE_PATH + movie.backdrop_path,
            urlPortada: IMAGE_PATH + movie.poster_path,
          };
        });
    }else{
        movies=[]
    }

    return movies;
  };

  //SE ESTAN DESTRUCTURANDO PORQUE ESTAMOS RECIBIENDO OBJETOS, LO HACEMOS ASI PORQUE DE ESTA MANERA
  //ES MAS FACIL PODER EXTENDER EL DIA DE MAÑANA POR LO QUE SEA
  static getById = async ({ id }) => {
    const movie = movies.find((m) => m.id == id);
    return movie;
  };

  static create = async ({ input }) => {
    const newMovie = {
      id: randomUUID(),
      ...input,
    };

    movies.push(newMovie);
    return newMovie;
  };

  /*  
    static delete=async ({id})=>{
        const movieIndex=movies.findIndex(movie=>movie.id===id)
        console.log(movieIndex)
        if(movieIndex<0){
         return false
        }
        console.log("candidad de movies antes de delete: "+movies.length)
        movies.splice(movieIndex,1)
        console.log("candidad de movies despues de delete: "+movies.length)
        return true
    }

    static update=async({id,input })=>{
        const movieIndex=movies.findIndex(movie=>movie.id===id)
        console.log("indice en el update "+movieIndex)
        // agarramos el index ya que nos servira tambien para ubicar a la peli
            if(movieIndex<0){
                return {message:'Movie not found'}
            }
            console.log("candidad de movies antes de update: "+movies.length)
            movies[movieIndex]={
                ...movies[movieIndex],
                ...input
            }
            console.log("candidad de movies despues de update: "+movies.length)
            return movies[movieIndex]
        } */
}
