import { RelativeService } from "../service/entity";
import * as schedule from "node-schedule";
import { Sequelize } from "sequelize-typescript";
class job {
    constructor() {
    }
    //Update checkout for relative at 00:01 AM every day
    public updateRelative(sequelize: Sequelize) {

        var rule = new schedule.RecurrenceRule();
        // rule.dayOfWeek = [0, new schedule.Range(0, 6)];
        rule.hour = 0;
        rule.minute = 1;
        // rule.second = 5;
        rule.tz = "Asia/Bangkok";
        let relativeService = new RelativeService(sequelize);
        schedule.scheduleJob(rule, async function () {
            console.log(`run updateRelative at ${new Date()}`);
            relativeService.updateCheckout();
        });
    }
}

export default new job();