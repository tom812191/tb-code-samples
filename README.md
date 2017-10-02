# tb-code-samples
Code samples for Tom Babineau

More code samples and full projects that I don't want publicly available can be provided upon request.

## Python
### dfs_optimizer
dfs_optimizer.py is a simple stand-alone command line utility to optimize lineups for DraftKings. The utility uses integer programming to maximize projected points subject to DraftKings lineup constraints.

Required Packages:
* pandas
* pulp

To run the example, download both dfs_optimizer.py and dfs_optimizer_projects.csv to the same directory and run:
`python dfs_optimizer.py dfs_optimizer_projections.csv`

### ApexRoads
While I'm unwilling to release code, all of ApexRoads was written by me using Python for the data processing and for some of the API microservices (using Flask).

* Pandas, Numpy, and SciPy are used in machine learning for road rating 
* Luigi is used for workflow management
* Spinx is used for documentation
* Psycopg2 is used for PostgreSQL and PostGIS

You can view ApexRoads [here](https://www.apexroads.com).

## React
### BestRidingAreas
A simple stand-alone page using react, d3, and Google maps from my company ApexRoads. The actual page can be viewed [here](https://www.apexroads.com/features/best-motorcycle-riding-areas)

### ApexRoads
While I'm unwilling to release code, all of ApexRoads was written by me using Meteor and React for the front-end.The mobile apps use Meteor, React, and Cordova.

You can view all of this at [ApexRoads](https://www.apexroads.com).
