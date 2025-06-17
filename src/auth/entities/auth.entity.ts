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

@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  token: string;

  @Field()
  newPassword: string;
}
