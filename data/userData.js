const pool = require('../database');

async function getUserByEmail(email) {
    if (!email || typeof email !== 'string') {
        throw new Error('Invalid email');
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
}

async function getUserById(userId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0];
}

async function createUser(name, email, password, salutation, country, marketingPreferences) {
    // validate to make that name, email and password
    if (!name || !email || !password || name.length > 100) {
        throw new Error("Invalid name, email or password");
    }
    const connection = await pool.getConnection();
    try {
        // begin a transaction: telling the database what happens next to the database (esp. updates and insert and deletes)
        // are considered to be part of the same operation
        await connection.beginTransaction();

        // insert the user data
        const [userResult] = await connection.query(`
            INSERT INTO users (name, email, password, salutation, country)
             VALUES (?, ?, ?, ?, ?)
            `, [name, email, password, salutation, country]);

        // the id of the new user
        const userId = userResult.insertId; // <-- get the primary key from a new row

        // check if marketing preferences is an array
        // marketing preferences should the name of the preference
        // eg. ['email'] OR ['email', 'sms']
        if (Array.isArray(marketingPreferences)) {
            for (let m of marketingPreferences) {
                // assume m is either 'sms' or 'email'
                // then we find the corresponding id
                const [preferenceResult] = await connection.query(`
                    SELECT id FROM marketing_preferences WHERE preference = ?
                    `, [m]);

                const preferenceId = preferenceResult[0].id;

                await connection.query(`
                    INSERT INTO user_marketing_preferences (user_id, preference_id)
                       VALUES (?, ?)
                    `, [userId, preferenceId]);


            }
        }
        await connection.commit(); // all changes made to the database at this point is now permanent

    } catch (e) {
        await connection.rollback(); // undo changes since the start of beginning a new transactions
        console.log(e);
        throw e; // throw the error to the service layer to handle
    } finally {
        // at the end of a try ... catch
        // all the code in finally will run
        // even if there is error
        // usually finally is used for clean up
        connection.close();
    }
}

// usually we do a PUT instead of PATCH
// if we update the user profile, we are actually sending a NEW profile over
// even if there is only change to one or two fields
async function updateUser(id, name, email, salutation, country, marketingPreferences) {
    // check if the id is truthly and is a number
    if (!id || typeof id !== 'number') {
        throw new Error('Invalid user ID');
    }

    const connection = await pool.getConnection();
    try {
        // we need a transaction between updating a user includes two tables:
        // users and marketing_preferences
        await connection.beginTransaction();

        // Update user data
        await connection.query(
            `UPDATE users SET name = ?, email = ?, salutation = ?, country = ? WHERE id = ?`,
            [name, email, salutation, country, id]
        );

        // Update marketing preferences by deleting existing ones and inserting new ones
        await connection.query(`DELETE FROM user_marketing_preferences WHERE user_id = ?`, [id]);
        if (Array.isArray(marketingPreferences)) {
            for (const preference of marketingPreferences) {
                const [preferenceResult] = await connection.query(
                    `SELECT id FROM marketing_preferences WHERE preference = ?`,
                    [preference]
                );

                if (preferenceResult.length === 0) {
                    throw new Error(`Invalid marketing preference: ${preference}`);
                }

                const preferenceId = preferenceResult[0].id;
                await connection.query(
                    `INSERT INTO user_marketing_preferences (user_id, preference_id) VALUES (?, ?)`,
                    [id, preferenceId]
                );
            }
        }

        // to make all changes to the database permanent
        await connection.commit();
    } catch (error) {
        // when error happens, we rollback all the changes done since the transaction
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteUser(userId) {
    if (!userId) {
        throw new Error("Invalid userid");
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // have to delete many to many relationships
        await connection.query('DELETE FROM user_marketing_preferences WHERE user_id = ?', [userId]);

        // delete the user itself
        await connection.query('DELETE FROM users WHERE id=?', [userId]);



        await connection.commit();

        return true;

    } catch (e) {
        console.log(e);
        connection.rollback();
        throw (e);
    } finally {
        connection.release();
    }
}


module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    updateUser,
    deleteUser
}