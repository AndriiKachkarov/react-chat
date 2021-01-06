import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Switch, Route, withRouter} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import 'semantic-ui-css/semantic.min.css';
import firebase from "./firebase";
import {createStore} from "redux";
import {connect, Provider} from 'react-redux';
import {composeWithDevTools} from "redux-devtools-extension";
import rootReducer from "./redux/reducers";
import {clearUser, setUser} from "./redux/actions";
import Spinner from "./components/Spinner";

const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {


    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.setUser(user);
                this.props.history.push('/');
            } else {
                this.props.clearUser();
                this.props.history.push('/login');
            }
        })
    }

    render() {
        console.log(this.props.location)
        return this.props.isLoading ? <Spinner/> : (
                <Switch>
                    <Route path='/login' component={Login}/>
                    <Route path='/register' component={Register}/>
                    <Route exact path='/' component={App}/>
                </Switch>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.user.isLoading
});
const mapDispatchToProps = {setUser, clearUser};

const RootWihAuth = withRouter(connect(mapStateToProps, mapDispatchToProps)(Root));

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWihAuth/>
        </Router>
    </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
