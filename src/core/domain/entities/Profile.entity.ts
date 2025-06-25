export interface ProfileProps {
  userId: string;
  birthDate: string;
  city: string;
  cpf: string;
  dojo: string;
  rank: string;
  sensei: string;
  photoUrl: string;
  createdAt: string;
}

export class Profile {
  readonly userId: string;
  readonly birthDate: string;
  readonly city: string;
  readonly cpf: string;
  readonly dojo: string;
  readonly rank: string;
  readonly sensei: string;
  readonly photoUrl: string;
  readonly createdAt: string;

  private constructor(props: ProfileProps) {
    this.userId = props.userId;
    this.birthDate = props.birthDate;
    this.city = props.city;
    this.cpf = props.cpf;
    this.dojo = props.dojo;
    this.rank = props.rank;
    this.sensei = props.sensei;
    this.photoUrl = props.photoUrl;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<ProfileProps, 'createdAt'>): Profile {
    return new Profile({
      ...props,
      createdAt: new Date().toISOString(),
    });
  }

  static fromPersistence(props: ProfileProps): Profile {
    return new Profile(props);
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  getProps(): ProfileProps {
    return {
      userId: this.userId,
      birthDate: this.birthDate,
      city: this.city,
      cpf: this.cpf,
      dojo: this.dojo,
      rank: this.rank,
      sensei: this.sensei,
      photoUrl: this.photoUrl,
      createdAt: this.createdAt,
    };
  }
}
