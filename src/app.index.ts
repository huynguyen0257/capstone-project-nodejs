import "module-alias/register";
import { App } from "./app.express";
import { DbContext } from "./repository/dbContext";
import job from "./util/background.jobs"
(async () => {
  
  const context: DbContext = new DbContext();
  if(process.argv.includes('--force')) {
    await context.connection(true);
  } else {
    await context.connection();
  }
  if(process.argv.includes('--seed')) {
    context.seed()
  }
  const app = new App(context.sequelize);
  job.updateRelative(context.sequelize);
  await app.listen();
})();
