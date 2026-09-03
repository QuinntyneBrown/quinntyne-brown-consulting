namespace Qbc.Workboard.Application.Common.Security;

public interface IAccessTokenIssuer
{
    AccessToken Issue(string signingKey);
}
