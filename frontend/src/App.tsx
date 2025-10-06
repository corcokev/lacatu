// src/App.tsx
import Items from "./components/items/Items";
import Header from "./components/header/Header";
import HomePage from "./components/home/HomePage";

export default function App() {
  return (
    <HomePage>
      {(props) => (
        <main className="mx-auto flex max-w-3/4 flex-col gap-4 p-4">
          <Header user={props.user} signOut={props.signOut} />
          <Items />
        </main>
      )}
    </HomePage>
  );
}
