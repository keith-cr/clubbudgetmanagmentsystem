const sql = require('mssql');

exports.isMemberOfClub = async function(userid, clubid) {
  try {
    await sql.connect('mssql://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' 
      + process.env.DB_HOST + '/' + process.env.DB_NAME);
    const result = await sql.query`EXEC IS_MEMBER_OF_CLUB @ClubID=${clubid}, @UserID=${userid}`;
    if (result.recordset[0])
      return true;
    else
      return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};