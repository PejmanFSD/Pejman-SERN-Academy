import Navbar from "./Components/Navbar";

export default function Home(error, setError) {
  return (
    <div>
      <h1>Pejman SERN Academy</h1>
      <Navbar error={error} setError={setError} />
    </div>
  );
}
