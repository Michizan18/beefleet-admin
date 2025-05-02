// EJEMPLO DE CONEXIÓN CON MYSQL
// export const verificarUsuario = async (usuario, contraseña) => {
//     try {
//       const respuesta = await fetch('http://tu-servidor.com/api/login.php', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ usuario, contraseña })
//       });
      
//       const datos = await respuesta.json();
      
//       if (!respuesta.ok) {
//         throw new Error(datos.mensaje || 'Error al iniciar sesión');
//       }
      
//       return datos;
//     } catch (error) {
//       throw error;
//     }
//   };