package com.it.helpdesk.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.it.helpdesk.entity.Role;
import com.it.helpdesk.entity.SupportTeam;
import com.it.helpdesk.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRoleAndSupportTeam(Role role, SupportTeam supportTeam);
}