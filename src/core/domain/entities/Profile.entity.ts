export interface ProfileProps {
  userId: string;
  birthDate: string;
  city: string;
  cpf: string;
  dojo: string;
  rank: string;
  sensei: string;
  photoUrl: string;
  registrationNumber: string;
  updatedAt: string;
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
  readonly registrationNumber: string;
  readonly updatedAt: string;

  private constructor(props: ProfileProps) {
    this.userId = props.userId;
    this.birthDate = props.birthDate;
    this.city = props.city;
    this.cpf = props.cpf;
    this.dojo = props.dojo;
    this.rank = props.rank;
    this.sensei = props.sensei;
    this.photoUrl = props.photoUrl;
    this.registrationNumber = props.registrationNumber;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ProfileProps, 'updatedAt'>): Profile {
    return new Profile({
      ...props,
      updatedAt: new Date().toISOString(),
    });
  }

  static fromPersistence(props: ProfileProps): Profile {
    return new Profile(props);
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
      registrationNumber: this.registrationNumber,
      updatedAt: this.updatedAt,
    };
  }
}
