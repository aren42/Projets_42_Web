<?php
	/***************************/
	/*       AuthFunctions     */
	/***************************/

	// Is Connected
	function is_connected() {
		if ($_SESSION)
			return (TRUE);
		return (FALSE);
	}
?>