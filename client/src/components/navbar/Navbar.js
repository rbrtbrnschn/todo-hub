import React from "react";
import {BasicNavItem, DropdownNavItem} from "./item"
import Hamburger from "./hamburger"
import "../../css/navbar/navbar.css";
const Navbar = (props) => {
	/**
	 * @BasicNavItem takes in: title,link
	 * @param {title} Name Of The Link
	 * @param {link} Href When Clicked On
	 *
	 * @DropdownNavItem takes in: title, pos, children
	 * @param {title} Name Of The Dropdown Menu
	 * @param {pos} Number [1,2,3], x>3 || x<1 wont work on mobile
	 *@param {childrne} Array Of @BasicNavItem s
	 */
	const homepage = {
		title:"Home",
		link:"/"
	}
	const account = {
		title: "Account",
		pos:1,
		children:[
			{title: "Login",link:"/login"},
			{title: "Register",link:"/createAccount"},
			{title: "Logout",link:"/api/auth/logout"},
		]
	}

	return(
	<nav className="navbar is-danger" role="navigation" aria-label="main navigation">
		<input type="checkbox" id="toggler" class="toggler" />
		<div className="navbar-brand">
			<BasicNavItem item={homepage} />
			<Hamburger />
		</div>
		<div id="navbarBasicExample" className="navbar-menu">
			<div className="navbar-start">
		
			</div>
			<div className="navbar-end">
			  
			  <DropdownNavItem item={account} />	
			
			</div>
		</div>
	</nav>
	);
}

export default Navbar;