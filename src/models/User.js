import mongoose, { Types } from 'mongoose'
import bcrypt from 'bcryptjs'


const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required:true
        },
        email: {
            type: String,
            required:true,
            unique:true
        },
        password:{
            type: String,
            required: true,
            minLength: 6

        },
         profileImage: {
            type: String,
            default: "",
            },
    
    },{timestamps:true}
)

// hash password before saving user to db
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema)

export default User;