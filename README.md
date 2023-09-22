## Publishing new Releases
- Update the version number with the year as the major version. Bump the minor version for new features and bump the patch number for bug fixes.
  - Ex. 2023.1.1 --> 2024.0.0 at the start of a new season
  - Ex. 2023.1.1 --> 2023.2.0 when adding new features
  - Ex. 2023.1.1 --> 2023.1.2 when patching bugs
- Create and set your GitHub token as a path variable ("GITHUB_TOKEN")
- Run `npm run publish`
- Build and upload the most recent version of ShamScout Editor 
- Build and upload the most recent version of the database

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

