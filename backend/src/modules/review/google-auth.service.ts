import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor(private config: ConfigService) {
    this.oauth2Client = new OAuth2Client({
      clientId: this.config.get("GOOGLE_CLIENT_ID"),
      clientSecret: this.config.get("GOOGLE_CLIENT_SECRET"),
      redirectUri: this.config.get("REVIEWS_REDIRECT_URI"),
    });
  }

  generateAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state: state,
      access_type: "offline",
      prompt: "consent",
    });
  }

  async getProfileData(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    return response.json();
  }
}
