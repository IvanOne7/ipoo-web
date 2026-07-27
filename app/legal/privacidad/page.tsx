export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p>Última actualización: julio de 2026</p>

      <h2>Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de tus datos es [TU-NOMBRE-O-EMPRESA], con
        domicilio en [TU-DIRECCIÓN] y correo de contacto [TU-EMAIL].
      </p>

      <h2>Qué datos recogemos</h2>
      <ul>
        <li>
          <strong>Datos de cuenta:</strong> tu correo electrónico al registrarte
          (o los datos de tu cuenta de Google si entras con ella).
        </li>
        <li>
          <strong>Contenido que creas:</strong> los baños que añades, tus
          valoraciones, comentarios y fotos.
        </li>
        <li>
          <strong>Ubicación:</strong> si nos das permiso, usamos tu ubicación
          para mostrarte baños cercanos. No la guardamos de forma permanente.
        </li>
      </ul>

      <h2>Para qué usamos tus datos</h2>
      <p>
        Usamos tus datos para que la app funcione: mostrarte baños cercanos,
        guardar tus valoraciones, gestionar tu cuenta y el sistema de puntos.
      </p>

      <h2>Con quién los compartimos</h2>
      <p>
        Nos apoyamos en proveedores que tratan datos por nosotros: Supabase (base
        de datos y autenticación), Vercel (alojamiento) y Google Maps (mapas). No
        vendemos tus datos a terceros.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes acceder, rectificar o eliminar tus datos, y solicitar que dejemos
        de tratarlos. Para ejercer estos derechos, escríbenos a [TU-EMAIL]. También
        puedes eliminar tu cuenta desde los ajustes.
      </p>

      <h2>Contacto</h2>
      <p>Para cualquier duda sobre privacidad: [TU-EMAIL].</p>
    </>
  );
}