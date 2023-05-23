using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        public AccountController(DataContext context, ITokenService tokenService)
        {
            _tokenService = tokenService;
            _context = context;
            
        }

        [HttpPost("register")] // POST: api/account/register?username=dave&password=pwd
                              // One way to do is using query string that are capable to bind to the arguments passed to the method
        public async Task<ActionResult<UserDto>> Register(RegisterDTO registerDto) 
        {
            if (await UserExists(registerDto.Username)) return BadRequest("Username is taken");
            using var hmac = new HMACSHA512(); // Using allows the garbage collector to dispose that variable
            
            
            var user = new AppUser
            {
                UserName = registerDto.Username.ToLower(),
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmac.Key
            };

            _context.Users.Add(user); // Begins tracking the given entity and applies an EntityState value of Added to it. 
                                      // The context also applies the same EntityState value of Added to all other objects in the graph that aren't already being tracked by the context.
                                       
            await _context.SaveChangesAsync();

            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user)
            };

        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users
            .Include(p => p.Photos)
            .SingleOrDefaultAsync(x => x.UserName == loginDto.Username);

            if (user == null) return Unauthorized("Invalid username");
            
            using var hmac = new HMACSHA512(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
            }
            
            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url
            };
        }

        private async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
        
    }
}

// ** EntityState is an enumeration that stores the state of the entity. 
// It can have one out of the 5 different values, these are ‘Added’, ‘Deleted’, ‘Detached’, ‘Modified’ & ‘Unchanged’. 
// When we want to create a new record in the database then the EntityState of the corresponding entity should be ‘Added’. 
// This tells EF Core that it has to insert the given record. Similarly if we want to update an entity then it must be ‘Modified’, 
// for deleting an entity it should be ‘Deleted’.

// Unchanged entity state means that there isn’t any change done for a given entity. Also note that Entity Framework Core keeps track of all the entities for changes, a value of Detached tells that the given entity is not being tracked.