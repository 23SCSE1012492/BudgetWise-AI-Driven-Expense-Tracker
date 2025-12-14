const { Sequelize } = require('sequelize');
const path = require('path');
const dbFile = process.env.DATABASE_FILE || path.join(__dirname, '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbFile,
  logging: false
});

const User = require('./user')(sequelize);
const Transaction = require('./transaction')(sequelize);
const Budget = require('./budget')(sequelize);
const Goal = require('./goal')(sequelize);
const ForumPost = require('./forumpost')(sequelize);

// Associations
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ForumPost, { foreignKey: 'userId', onDelete: 'CASCADE' });
ForumPost.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Transaction,
  Budget,
  Goal,
  ForumPost
};
