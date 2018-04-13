# Spin Transport Viewer

This is a viewer for bulk spin transport Multi-Spin Magnetic Resonance simulation results created using the simulation codes in the [spin-transport](https://github.com/ricopicone/spin-transport) repository.

### Software Layout

Simulation runs are stored on an SQL server for later analysis. The files in the `python` directory are Amazon AWS lambda functions. These functions handle getting data from the SQL server. These lambda functions are used by the webpage in the `HTML` directory to show a list of simulation resuls, and an animated plot of the results.

### Libraries Used

* [jQuery](https://jquery.com/)
* [Bootstrap](https://getbootstrap.com/)
* [jQuery QueryBuilder](http://querybuilder.js.org/index.html): Used for custom SQL database queries.
* [Array to Table](https://gist.github.com/mapsi/8939976): Used to show SQL database query results.
* [Plotly.js](https://plot.ly/): Used for creating the animated plot.
