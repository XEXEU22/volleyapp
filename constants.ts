
import { Player, Gender, SkillLevel } from './types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    gender: Gender.MASCULINO,
    rating: 4.8,
    level: SkillLevel.PRO,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDxj32YG9gInq-9KL51i4f25dfOho6KA6QdaoCeDojyeOW2OpWj0ItB_HTCa2Vg54h5gfchMWbS11CvfZw9bVTRq2Q2no_Fu9mmKIKb2cpsjUylHrobawx9pOr8saTMnxAmrxBJ6_7fBb3wr3P8B6dkKKhq_tCA7sqx3KCF7jfuPmDN51hWOTuVE6brZtHVdRLlVyFUEt02wCROCTztFpIvBOMREg_wKnzWGd2hjwqQrTG9QtWKO9lG4v3O2bV8Bz0tghihpa9r0D0',
    isMVP: true,
    skills: { ataque: 4, defesa: 5, recepcao: 5, levantamento: 5, saque: 5, bloqueio: 4 },
  },
  {
    id: '2',
    name: 'Ana Costa',
    gender: Gender.FEMININO,
    rating: 5.0,
    level: SkillLevel.CAPITAO,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjKWPOcf-p-j_mQnV8N0qPlf8sHa6a4hdO2UYOfTllbsqNH6819Emne8itkhOFVeaAXIcLhwlzMiZE_gAD7HQGJe26GhqPOe9HdqIHlkbSsiY9UHpOw3ZpNCZoBOsM1_2STp37P3JG4JidGURfa3SH4obHXOYEespWJELwpkUbmrfMH3j0Y9roAcbdriWfm-wr_ib3BH4URfS471Vnvf5KRyIYH7X2iYdBiAhu1wW6sLSWKKxq9u6POfoTXb_lUgCdkpuh-nfRc8EE',
    skills: { ataque: 5, defesa: 5, recepcao: 5, levantamento: 5, saque: 5, bloqueio: 5 },
  },
  {
    id: '3',
    name: 'Lucas Mendes',
    gender: Gender.MASCULINO,
    rating: 4.2,
    level: SkillLevel.INTERMEDIARIO,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCkyZ_r4kV8QZ6EIsMRQniI7hnR7lU4yMQfb27fFiR9QgUPppWFGF_xZ0FuwG7zoXADX9M17HxGRJVfyb04aKUzTKrucIcAT8NhKYuObIlHvXeVO7NXz-JdQRxn-YUFPqMZD0FouVI06KCMDEX6vnkEks8mD4SGQI6TOntB6hUDCsj9-18Yqu2SP5jXlclTlsx8gEouUYnDKEZOihKu5a8gYsyLD5k7k6VE3K6AXgqQ5L8tioLWKW4Ik-G-xKENFXOmb4laly-VTpq',
    skills: { ataque: 5, defesa: 3, recepcao: 4, levantamento: 3, saque: 5, bloqueio: 4 },
  },
  {
    id: '4',
    name: 'Ricardo Braga',
    gender: Gender.MASCULINO,
    rating: 3.9,
    level: SkillLevel.CASUAL,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeEBzCfGko8IrLR70eboKAeSI47shXhtkcCGEK82qKgPXeywcwPnzT-Y3WOHKzoct5zQ2r-h1I2Md-esQuiIo4LEWetmpU3lxHlCnouhw7CcvQ1ye9X-Z3KsTRbQZaTbo3GVQnuzD6PgeQ4IvzktEFdGAcFAHg2auWrjCUQknRQr-fNVcqlkyuHhpe8aEnEA5Cp-zhDZAafduJqODP_n3H-kcjhZW90OeGSYEAf6bsdJcz1VRyeymeejnkO3pjJD1meYy1u9WYngg1',
    skills: { ataque: 4, defesa: 3, recepcao: 3, levantamento: 3, saque: 4, bloqueio: 5 },
  },
  {
    id: '5',
    name: 'Beatriz Lima',
    gender: Gender.FEMININO,
    rating: 4.6,
    level: SkillLevel.PRO,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkqH9n2A4dXONib0kpfa-vR3MrVZp-A55PMkYUkP2SxOn6bK0dCI-p0q8doF9nsO4vNrevpB6sJo0miOdoq67335m8ucP747K2bpNMGS5jyWZLWhPgAVPhOHwqKYt2WU2qiQUUI1f0m9DNoc_-gYduyLnufFlHlrFacwPw7exLaH5z5Gi3KdR7P0q7hlJF8UvGRgmrGl-rHQ6feGC8GyFTibxXw5ZI72azQTjhtjgWd_mUMvr8hqGujXFBQed7QgEGsOMJgcy8tvlc',
    skills: { ataque: 3, defesa: 5, recepcao: 5, levantamento: 4, saque: 4, bloqueio: 3 },
  }
];
