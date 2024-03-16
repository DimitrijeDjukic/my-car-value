import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { promisify } from "util";
import { randomBytes, scrypt as _scrypt } from "crypto";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async signup(email: string, password: string) {

    // See if email is in use
    const users = await this.usersService.find(email);

    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // Generate a salt 
    const salt = randomBytes(8).toString('hex')

    // Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together <- this is stored inside the db
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(email, result)

    // Return the user
    return user;


  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    console.log(user);

    if (!user) {
      throw new NotFoundException('not found user')
    }

    const [salt, storedHash] = user.password.split('.');
    console.log(salt); // Outputs: "randomSalt"
    console.log(storedHash); // Outputs: "randomHash"

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}