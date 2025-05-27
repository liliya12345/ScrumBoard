import './App.css';
import {BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Board from "./components/board/Board";



function App() {
    return (
        <>
            <Router>

                    <Routes>

                        <Route path="/" element={<Board/>}/>
                    </Routes>

               
            </Router>


        </>
    );
}

export default App;
