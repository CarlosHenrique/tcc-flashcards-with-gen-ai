import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token!: string;

  @Field()
  email!: string;
}

@InputType()
export class LoginUserInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
